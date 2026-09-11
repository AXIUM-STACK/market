import React from 'react'
import Navbar from './Navbar';

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div>
        <Navbar />
        {children}
    </div>
  )
}

export default Wrapper