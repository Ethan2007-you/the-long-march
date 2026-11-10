"""Generate competition READMEs and a full/anonymous submission archive.

Run after npm run build. Team details are maintained in docs/team.json.
The original project is never deleted or moved.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import argparse, io, json


def readme(project: Path, team: dict, anonymous: bool) -> str:
    content = (project / 'docs/readme-content.md').read_text(encoding='utf-8')
    lock = json.loads((project / 'package-lock.json').read_text(encoding='utf-8'))
    for name in ['react', 'react-dom', 'framer-motion', 'gsap', 'lucide-react', 'vite', 'typescript', '@types/react', '@types/react-dom']:
        content = content.replace('{{' + name + '}}', lock['packages']['node_modules/' + name]['version'])
    verification = project / 'docs/verification.json'
    browser = json.loads(verification.read_text(encoding='utf-8')).get('browser', 'Microsoft Edge') if verification.exists() else 'Microsoft Edge'
    content = content.replace('{{BROWSER}}', browser)
    if anonymous:
        section = '参赛组别：' + team['group'] + '。本说明为匿名评审版本，仅保留作品介绍、运行方法、技术与素材说明。'
    else:
        rows = ['## 参赛信息', '', f"- 队伍名：{team['name']}", f"- 参赛组别：{team['group']}", f"- 队长：{team['captain']}", f"- 联系电话：{team['phone']}", '', '| 姓名 | 学院 | 年级 | 学号 | 分工 |', '| --- | --- | --- | --- | --- |']
        rows += ['| ' + ' | '.join(member.get(key, '待补充') for key in ['name', 'college', 'grade', 'studentId', 'role']) + ' |' for member in team['members']]
        section = '\n'.join(rows)
    content = content.replace('{{TEAM}}', section)
    assert '{{' not in content and '}}' not in content
    return content



def public_readme(project: Path, team: dict) -> str:
    content = readme(project, team, True)
    content = content.replace('2026 年武汉大学“零杯”网页设计大赛参赛作品，选择主题“长征万里，薪火千秋”。', '')
    section = '参赛组别：' + team['group'] + '。本说明为匿名评审版本，仅保留作品介绍、运行方法、技术与素材说明。'
    content = content.replace(section + '\n\n', '')
    content = content.replace('本作品提供移动端响应式版本，作为移动端适配加分项的实现说明。', '本作品提供移动端响应式版本。')
    return content


def files_to_include(project: Path):
    roots = ['src', 'public', 'dist', 'docs', 'scripts']
    standalone = ['.gitignore', 'index.html', '打开长征展览.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts']
    for name in standalone:
        yield Path(name)
    for name in roots:
        for file in sorted((project / name).rglob('*')):
            if file.is_file() and '__pycache__' not in file.parts:
                yield file.relative_to(project)


def personal_tokens(team: dict):
    return [team['name'], team['captain'], team['phone']] + team.get('privateAliases', []) + [member[key] for member in team['members'] for key in ['name', 'studentId'] if member.get(key) not in [None, '', '待补充']]


def archive(project: Path, team: dict, anonymous: bool) -> bytes:
    result = io.BytesIO()
    root = '长征-不朽征途/'
    with ZipFile(result, 'w', ZIP_DEFLATED, compresslevel=6) as zipfile:
        zipfile.writestr(root + 'README.md', readme(project, team, anonymous))
        for relative in files_to_include(project):
            # Keep the generator and its neutral template, but omit private team data.
            if anonymous and relative.as_posix() == 'docs/team.json':
                continue
            data = (project / relative).read_bytes()
            if anonymous:
                for token in personal_tokens(team):
                    if token.encode('utf-8') in data or token.encode('utf-16-le') in data:
                        raise ValueError(f'Personal information found in anonymous package: {relative}')
            zipfile.writestr(root + relative.as_posix(), data)
    result.seek(0)
    with ZipFile(result) as zipfile:
        assert zipfile.testzip() is None
    return result.getvalue()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--readme-only', action='store_true')
    parser.add_argument('--output-dir', type=Path)
    args = parser.parse_args()
    project = Path(__file__).resolve().parents[1]
    team = json.loads((project / 'docs/team.json').read_text(encoding='utf-8'))
    (project / 'README.md').write_text(public_readme(project, team), encoding='utf-8')
    (project / 'README.submission.md').write_text(readme(project, team, False), encoding='utf-8')
    (project / 'README.anonymous.md').write_text(readme(project, team, True), encoding='utf-8')
    if args.readme_only:
        print('Updated public README and local-only submission READMEs.')
        return
    assert (project / 'dist/index.html').is_file(), 'Build the project first.'
    output = args.output_dir or project.parent / (project.name + '-备份与提交')
    output.mkdir(exist_ok=True, parents=True)
    title = '零杯' + team['group'] + '-' + team['name'] + '-' + team['captain']
    target = output / (title + '.zip')
    # Build both variants in memory and validate before replacing an existing package.
    full, anonymous = archive(project, team, False), archive(project, team, True)
    temporary = target.with_suffix('.zip.tmp')
    with ZipFile(temporary, 'w', ZIP_DEFLATED) as zipfile:
        zipfile.writestr('2026-' + title + '-完整版本.zip', full)
        zipfile.writestr('2026-' + title + '-匿名版本.zip', anonymous)
    with ZipFile(temporary) as zipfile:
        assert len(zipfile.namelist()) == 2 and zipfile.testzip() is None
    temporary.replace(target)
    pending = [f"{member['name']}: {key}" for member in team['members'] for key in ['studentId', 'role'] if member.get(key) == '待补充']
    print(json.dumps({'package': str(target), 'anonymousScan': 'passed', 'pendingTeamFields': pending}, ensure_ascii=False))


if __name__ == '__main__':
    main()
