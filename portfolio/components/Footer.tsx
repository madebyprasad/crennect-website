'use client';

import { useEffect } from 'react';

export default function Footer() {
  useEffect(() => {
    const modal = document.getElementById('quizModal');
    const agreeBtn = document.getElementById('quizAgreeBtn');
    const quizBtns = document.querySelectorAll('.quiz-btn');

    quizBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    if (agreeBtn && modal) {
      agreeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    }
  }, []);

  return (
    <>
      {/* Footer - exact copy from homepage */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Left: Explore Box */}
            <div className="footer-explore">
              <div className="explore-box">
                <video src="/assets/video/hero-bg.webm" autoPlay loop muted playsInline></video>
                <div className="explore-overlay">
                  <span>Explore more</span>
                  <img src="/assets/images/arrow.webp" alt="Arrow" />
                </div>
              </div>
            </div>
            
            {/* Center: Quiz */}
            <div className="footer-quiz">
              <p className="quiz-label">Question</p>
              <h3 className="quiz-question">When did everyone<br/>start sounding the same?</h3>
              <div className="quiz-options">
                <button className="quiz-btn">ChatGPT</button>
                <button className="quiz-btn">MBA</button>
                <button className="quiz-btn">2020</button>
              </div>
            </div>
            
            {/* Right: Links */}
            <div className="footer-links">
              <nav>
                <a href="/index.html">Home</a>
                <a href="/contact.html">Contact</a>
                <a href="/services.html">Services</a>
                <a href="https://portfolio.crennect.com/portfolio">Case Studies</a>
                <a href="/about.html">About Us</a>
                <a href="/index.html#blogs">Blogs</a>
              </nav>
              <div className="social-icons">
                <a href="https://www.linkedin.com/company/crennect/" target="_blank" rel="noopener noreferrer" aria-label="Visit us on LinkedIn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </a>
                <a href="https://www.youtube.com/@prasaddanie" target="_blank" rel="noopener noreferrer" aria-label="Visit Breaking Brands">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.54-2.12-9.91-5.04-.42.72-.66 1.55-.66 2.44 0 1.67.85 3.14 2.14 4-.79-.03-1.53-.24-2.18-.6v.06c0 2.33 1.66 4.28 3.86 4.72-.4.11-.83.17-1.27.17-.31 0-.62-.03-.92-.08.62 1.94 2.42 3.35 4.55 3.39-1.67 1.31-3.77 2.09-6.05 2.09-.39 0-.78-.02-1.17-.07 2.18 1.4 4.77 2.21 7.56 2.21 9.05 0 14-7.5 14-14 0-.21 0-.42-.02-.63.96-.69 1.8-1.56 2.46-2.55z"/></svg>
                </a>
                <a href="https://www.instagram.com/crennectmedia/" target="_blank" rel="noopener noreferrer" aria-label="Visit us on Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
                </a>
                <a href="https://wa.me/7977493025" target="_blank" rel="noopener noreferrer" aria-label="Chat with us">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/></svg>
                </a>
              </div>
              <img src="/assets/images/logo.svg" alt="Crennect" className="footer-logo" />
            </div>
          </div>
          
          <div className="footer-bottom">
            <a href="#terms">Terms & Conditions</a>
            <span>©2025 All Rights Reserved</span>
            <a href="#privacy">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {/* Quiz Modal - exact copy from homepage */}
      <div className="quiz-modal" id="quizModal">
        <div className="quiz-modal-content">
          <div className="quiz-modal-image">
            <img src="/assets/images/footer-popup.webp" alt="" />
          </div>
          <div className="quiz-modal-text">
            <h2>
              It&apos;s when brands fail to <span>position</span> themselves in the market.
            </h2>
            <button id="quizAgreeBtn">yeah, I agree.</button>
          </div>
        </div>
      </div>
    </>
  );
}
