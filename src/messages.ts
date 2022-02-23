import chalk from 'chalk';
import colors from '@wedgekit/color';

export default {
  error: (...args: string[]) => chalk.hex(colors.R500)('❌', ...args, '\n'),
  header: (...args: string[]) => chalk.hex(colors.R500)(...args, '\n'),
  success: (...args: string[]) => chalk.hex(colors.G600)(...args, '\n'),
  text: (...args: string[]) => chalk.hex(colors.B400)(...args, '\n'),
  warning: (...args: string[]) => chalk.hex(colors.Y300)(...args, '\n'),
};
