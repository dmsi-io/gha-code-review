import glob from 'glob-promise';
import path from 'path';

export const getAllPackages = async (): Promise<string[]> => {
  const paths = await glob('**/{package.json,go.mod}', {
    cwd: process.env.BASE_DIR ?? '',
    ignore: ['**/example/**', '**/node_modules/**'],
  });

  return Array.from(
    new Set([
      process.env.BASE_DIR,
      ...paths.map((packageJsonPath) => {
        const fullPackageJsonPath = path.join(process.env.BASE_DIR ?? '', packageJsonPath);
        return path.dirname(fullPackageJsonPath);
      }),
    ]),
  ).filter((p): p is string => !!p || p === '');
};
