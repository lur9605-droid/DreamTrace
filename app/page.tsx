import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// We need a simple module CSS for the home page, but for now I'll use inline styles or reuse globals
// to avoid creating another file if not strictly requested. 
// However, creating a page.module.css is better practice.

export default function Home() {
  return (
    <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #7928ca 0%, #ff0080 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 800
      }}>
        DreamTrace
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
        捕捉稍纵即逝的梦境，探索潜意识的深处。
      </p>
      
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/analysis" style={{
          padding: '12px 32px',
          background: '#0070f3',
          color: 'white',
          borderRadius: '50px',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(0,118,255,0.39)'
        }}>
          开始记录
        </Link>
        <Link href="/dictionary" style={{
          padding: '12px 32px',
          background: 'white',
          color: '#333',
          border: '1px solid #eaeaea',
          borderRadius: '50px',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
        }}>
          查阅词典
        </Link>
      </div>
    </div>
  );
}
