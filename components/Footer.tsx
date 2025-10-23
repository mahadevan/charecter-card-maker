import React from 'react';

interface FooterProps {
  theme: 'light' | 'dark';
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
  const textClasses = theme === 'light' ? 'text-neutral-500' : 'text-neutral-500';

  return (
    <footer className={`py-6 text-center ${textClasses}`}>
      <p>❤️‍🔥 Made with Love by Musing Maddy</p>
    </footer>
  );
};

export default Footer;