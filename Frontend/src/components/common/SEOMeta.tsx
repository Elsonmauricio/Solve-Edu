import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEOMeta: React.FC<SEOMetaProps> = ({ 
  title = "Solve Edu | Conecta Talento Académico a Desafios Reais", 
  description = "Plataforma que transforma projetos académicos em soluções para empresas.", 
  image = "https://solve-edu.vercel.app/og-image.png", // Substitui pelo teu URL real
  url = "https://solve-edu.vercel.app" 
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEOMeta;