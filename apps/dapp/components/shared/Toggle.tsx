import { MouseEventHandler } from "react";


export interface IToggle {
  type?: 'BLUE' | 'GREEN';
  active:boolean
  onClick:MouseEventHandler
}

export const Toggle: React.FC<IToggle> = ({
  type,active,onClick
}) => {
  return <div className={`c-toggle ${active}`} onClick={onClick} >
    <div className="c-toggle-button"></div>
  </div>;
};

Toggle.displayName = 'Toggle';
