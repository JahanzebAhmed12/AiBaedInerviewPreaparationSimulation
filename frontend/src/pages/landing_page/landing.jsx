import React from 'react';
import Header from './components/Header';
import Landing from './components/Landing';
import WhatWeAre from './components/WhatWeAre';
import Services from './components/Services';
import SpecialFeatures from './components/SpecialFeatures';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';


const App = () => {
  return (
    <>
      <Header />
      <Landing />
      <WhatWeAre />
      <Services />
      <SpecialFeatures />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
};

export default App;
