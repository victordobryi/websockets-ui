import { v4 } from 'uuid';

export const getUniqueId = () =>
  parseInt(
    v4()
      .replace(/\D/g, '')
      .slice(0, Math.floor(Math.random() * 7) + 4),
    10
  );
