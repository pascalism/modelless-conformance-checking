import { Button, FlexBox, Menu, MenuItem } from '@ui5/webcomponents-react';
import { useState } from 'react';

const ButtonMenu = ({ items, actions }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  return (
    <>
      <FlexBox justifyContent="End" style={{ margin: 10 }}>
        <Button
          id={'openMenuBtn'}
          onClick={() => {
            setMenuIsOpen(true);
          }}
          design="Transparent"
          icon="overflow"
        />
        <Menu
          onItemClick={({
            detail: {
              item: {
                dataset: { key },
              },
            },
          }) => {
            actions[key]();
          }}
          opener={'openMenuBtn'}
          open={menuIsOpen}
          onAfterClose={() => {
            setMenuIsOpen(false);
          }}
        >
          {items.map(({ icon, text, key }) => (
            <MenuItem key={key} icon={icon} text={text} data-key={key} />
          ))}
        </Menu>
      </FlexBox>
    </>
  );
};
export default ButtonMenu;
