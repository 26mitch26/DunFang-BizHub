import { GithubOutlined } from '@ant-design/icons';
import packageJson from '@root/package.json';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';

const getRepoUrl = () => {
  if (!packageJson.repository) {
    return '';
  }

  const repo =
    typeof packageJson.repository === 'string'
      ? packageJson.repository
      : (packageJson.repository as { url: string }).url;
  if (repo.includes('ant-design/ant-design-pro')) {
    return '';
  }
  const match = repo.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  return match ? `https://github.com/${match[1]}/${match[2]}` : '';
};

const REPO_URL = getRepoUrl();
const COMMIT_HASH = process.env.COMMIT_HASH || '';

const useStyles = createStyles(({ token, css }) => ({
  footer: css`
    padding: 16px 24px;
    text-align: center;
    color: ${token.colorTextDescription};
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeight};
    background: transparent;
  `,
  copyright: css`
    margin-bottom: 6px;
  `,
  meta: css`
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    font-family: ${token.fontFamilyCode};
  `,
  link: css`
    color: ${token.colorTextDescription};
    text-decoration: none;

    &:hover {
      color: ${token.colorText};
    }
  `,
}));

const Footer: React.FC = () => {
  const { styles } = useStyles();
  const year = new Date().getFullYear();

  return (
    <div className={styles.footer}>
      <div className={styles.copyright}>DunFang BizHub &copy; {year}</div>
      <div className={styles.meta}>
        <span>ver {__APP_VERSION__}</span>
        {COMMIT_HASH && (
          <>
            <Divider type="vertical" />
            <span>{COMMIT_HASH.slice(0, 7)}</span>
          </>
        )}
        {REPO_URL && (
          <>
            <Divider type="vertical" />
            <a
              className={styles.link}
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubOutlined style={{ marginRight: 4 }} />
              Repository
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Footer;
