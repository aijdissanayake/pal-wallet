import { shell } from 'electron';

// eslint-disable-next-line import/prefer-default-export
export const openExplorerLink = (link) => {
  shell.openExternal(`${process.env.PPN_EXPLORER_IP}${link}`);
};
