import { Icon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';
import peopleFill from '@iconify/icons-eva/people-fill';
import shoppingBagFill from '@iconify/icons-eva/shopping-bag-fill';
import imageFill from '@iconify/icons-eva/image-fill';
import folderAddFill from '@iconify/icons-eva/folder-add-fill';
import folderRemoveFill from '@iconify/icons-eva/folder-remove-fill';
import folderFill from '@iconify/icons-eva/folder-fill';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'user',
    path: '/dashboard/user',
    icon: getIcon(peopleFill)
  },
  {
    title: 'gallery',
    path: '/dashboard/gallery',
    icon: getIcon(imageFill)
  },
  {
    title: 'product',
    path: '/dashboard/products',
    icon: getIcon(shoppingBagFill)
  },
  {
    title: 'owned tasks',
    path: '/dashboard/owned',
    icon: getIcon(folderAddFill)
  },
  {
    title: 'claimed tasks',
    path: '/dashboard/claimed',
    icon: getIcon(folderRemoveFill)
  },
  {
    title: 'tasks to be claimed',
    path: '/dashboard/free',
    icon: getIcon(folderFill)
  }
];

export default sidebarConfig;
