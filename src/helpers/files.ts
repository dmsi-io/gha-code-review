import glob from 'glob-promise';
import path from 'path';

export const getAllPackages = async () => {
  const paths = await glob('**/package.json', {
    cwd: process.env.BASE_DIR ?? '',
    ignore: ['**/example/**', '**/node_modules/**'],
  });

  return paths.map((packageJsonPath) => {
    const fullPackageJsonPath = path.join(process.env.BASE_DIR ?? '', packageJsonPath);
    return path.dirname(fullPackageJsonPath);
  });
};
