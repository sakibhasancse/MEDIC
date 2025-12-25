'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/navigation';
import { Button, Menu, MenuItem } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useState, useTransition } from 'react';

export const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (newLocale: 'en' | 'bn') => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
    handleClose();
  };

  return (
    <>
      <Button
        color="inherit"
        startIcon={<LanguageIcon />}
        onClick={handleClick}
        sx={{ minWidth: 100 }}
      >
        {locale === 'en' ? 'English' : 'বাংলা'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem 
          onClick={() => changeLanguage('en')}
          selected={locale === 'en'}
        >
          English
        </MenuItem>
        <MenuItem 
          onClick={() => changeLanguage('bn')}
          selected={locale === 'bn'}
        >
          বাংলা
        </MenuItem>
      </Menu>
    </>
  );
};
