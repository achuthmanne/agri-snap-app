let isDrawerOpen = false;

export const setDrawer = (val: boolean) => {
  isDrawerOpen = val;
};

export const getDrawer = () => isDrawerOpen;