import { PropsWithChildren } from 'react';
import { IoAlertCircle } from 'react-icons/io5';

import style from './Info.module.scss';

export default function Info({ children }: PropsWithChildren) {
  return (
    <div className={style.infoLabel}>
      <IoAlertCircle />
      {children}
    </div>
  );
}
