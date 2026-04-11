import { useSelector } from 'react-redux';

export const useSiteConfig = () => {
  const config = useSelector(state => state.config);

  return {
    branding: config.branding,
    contact: config.contact,
    social: config.social,
    payment: config.payment,
  };
};
