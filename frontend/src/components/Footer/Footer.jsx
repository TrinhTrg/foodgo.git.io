import React from 'react';
import styles from './Footer.module.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import logo from "../../assets/Logo.png";
import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.firstColumn}>
          {/*1: Logo */}
          <div className={styles.logo}>
            <img src={logo} alt="FoodGo Logo" />
          </div>
          <p>
            Ứng dụng tìm hiểu và khám phá ẩm thực đầu tiên tại Việt Nam.
            Mang đến cho bạn những trải nghiệm ẩm thực tuyệt vời nhất.
          </p>
          {/*2: Icon mạng xã hội */}
          <div className={styles.socialIcons}>
            <a href="http://facebook.com/chin1407"><FaFacebookF /></a>
            <a href="http://facebook.com/chin1407"><FaTwitter /></a>
            <a href="http://facebook.com/chin1407"><FaInstagram /></a>
            <a href="http://facebook.com/chin1407"><FaYoutube /></a>
          </div>
        </div>

        <div className={styles.secondColumn}>
          <h4>About FoodGo</h4>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/kham-pha">Discover</NavLink></li>
            <li><NavLink to="/about-us">About Us</NavLink></li>
            <li><NavLink to="/contact">Contact Us</NavLink></li>
            <li><NavLink to="/partners">Partners</NavLink></li>
          </ul>
        </div>

        <div className={styles.thirdColumn}>
          <h4>Support</h4>
          <ul>
            <li><NavLink to="/contact">Contact Us</NavLink></li>
            <li><NavLink to="/help-center">Help Center</NavLink></li>
            <li><NavLink to="/faq">FAQ</NavLink></li>
            <li><NavLink to="/report">Report</NavLink></li>
            <li><NavLink to="/feedback">Feedback</NavLink></li>
          </ul>
        </div>
      </div>
      {/*3: Copyright và link phụ */}
      <div className={styles.bottomFooter}>
        <span className={styles.copyright}>
          © 2025 FoodGo. All rights reserved.
        </span>
        <div className={styles.subLinks}>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/cookies">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;