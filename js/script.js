// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Dark mode toggle
  const themeToggle = document.querySelector('.theme-toggle');
  
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    
    // Switch icon
    const themeIcon = themeToggle.querySelector('span');
    if (document.body.classList.contains('dark-theme')) {
      themeIcon.textContent = 'light_mode';
    } else {
      themeIcon.textContent = 'dark_mode';
    }
  });

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });

  // Form submission handling
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // 获取表单字段值
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // 构建邮件内容
      const mailtoSubject = encodeURIComponent(subject);
      const mailtoBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      
      // 创建mailto链接
      const mailtoLink = `mailto:contact@devstudio.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      
      // 打开邮件客户端
      window.location.href = mailtoLink;
      
      // 可选：显示成功消息或重置表单
      alert('Opening email client...');
      
      // 仅在成功打开后清空表单
      setTimeout(() => {
        contactForm.reset();
      }, 1000);
    });
  }

  // Scroll animation
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.feature-card, .app-card, .testimonial-card, .stat-card');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      
      if (elementPosition < screenPosition) {
        element.style.opacity = 1;
        element.style.transform = 'translateY(0)';
      }
    });
  };

  // Initialize element styles
  const initAnimationStyles = function() {
    const elements = document.querySelectorAll('.feature-card, .app-card, .testimonial-card, .stat-card');
    
    elements.forEach(element => {
      element.style.opacity = 0;
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
  };

  // Mobile menu
  const setupMobileMenu = function() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuButton) {
      // 为移动菜单按钮添加点击事件
      mobileMenuButton.addEventListener('click', function() {
        const isVisible = navLinks.style.display === 'flex';
        navLinks.style.display = isVisible ? 'none' : 'flex';
        
        // 切换图标
        const menuIcon = this.querySelector('span');
        menuIcon.textContent = isVisible ? 'menu' : 'close';
      });
    }

    // 窗口大小改变时，重置菜单状态
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        navLinks.style.display = '';
        // 重置菜单图标
        if (mobileMenuButton) {
          const menuIcon = mobileMenuButton.querySelector('span');
          menuIcon.textContent = 'menu';
        }
      }
    });
  };

  // 轮播功能实现
  const setupCarousels = function() {
    setupCarousel('.app-carousel', '.app-dots');
    setupCarousel('.testimonial-carousel', '.testimonial-dots');
  };

  function setupCarousel(carouselSelector, dotsContainerSelector) {
    const carousel = document.querySelector(carouselSelector);
    const dotsContainer = document.querySelector(dotsContainerSelector);
    let slideWidth = getSlideWidth(carousel);
    let currentIndex = 0;
    let slideCount = carousel.children.length;
    let autoplayInterval;
    
    // 获取当前轮播项的宽度（考虑间距）
    function getSlideWidth(carousel) {
      const firstChild = carousel.querySelector(':first-child');
      if (!firstChild) return 0;
      // 获取实际宽度 + 外边距 + 间距
      return firstChild.offsetWidth + parseInt(window.getComputedStyle(firstChild).marginRight) + 20;
    }
    
    // 窗口大小改变时，重新计算宽度并更新当前位置
    window.addEventListener('resize', () => {
      slideWidth = getSlideWidth(carousel);
      // 确保在窗口大小改变后，轮播位置保持正确
      goToSlide(currentIndex, false);
    });
    
    // 创建指示点
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
    
    // 更新指示点
    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
    
    // 滚动到指定幻灯片
    function goToSlide(index, smooth = true) {
      if (index < 0) {
        index = 0;
      } else if (index >= slideCount) {
        index = slideCount - 1;
      }
      currentIndex = index;
      
      const scrollPosition = index * slideWidth;
      carousel.scrollTo({
        left: scrollPosition,
        behavior: smooth ? 'smooth' : 'auto'
      });
      
      updateDots();
    }
    
    // 下一张幻灯片
    function nextSlide() {
      if (currentIndex < slideCount - 1) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(0); // 回到第一张
      }
    }
    
    // 拖拽滑动功能
    let isDragging = false;
    let startPosition = 0;
    let startScrollLeft = 0;
    
    carousel.addEventListener('mousedown', (e) => {
      isDragging = true;
      startPosition = e.pageX;
      startScrollLeft = carousel.scrollLeft;
      carousel.style.cursor = 'grabbing';
    });
    
    carousel.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const distance = e.pageX - startPosition;
      carousel.scrollLeft = startScrollLeft - distance;
    });
    
    carousel.addEventListener('mouseup', () => {
      isDragging = false;
      carousel.style.cursor = 'grab';
      
      // 确定当前应该滚动到哪个幻灯片
      const newIndex = Math.round(carousel.scrollLeft / slideWidth);
      goToSlide(newIndex);
      resetAutoplay();
    });
    
    carousel.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        carousel.style.cursor = 'grab';
      }
    });
    
    // 防止拖拽时选中文本
    carousel.addEventListener('selectstart', (e) => {
      if (isDragging) e.preventDefault();
    });
    
    // 添加触摸支持
    carousel.addEventListener('touchstart', (e) => {
      isDragging = true;
      startPosition = e.touches[0].pageX;
      startScrollLeft = carousel.scrollLeft;
    });
    
    carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const distance = e.touches[0].pageX - startPosition;
      carousel.scrollLeft = startScrollLeft - distance;
      // 防止页面滚动
      e.preventDefault();
    });
    
    carousel.addEventListener('touchend', () => {
      isDragging = false;
      
      // 确定当前应该滚动到哪个幻灯片
      const newIndex = Math.round(carousel.scrollLeft / slideWidth);
      goToSlide(newIndex);
      resetAutoplay();
    });
    
    // 自动播放功能
    function startAutoplay() {
      autoplayInterval = setInterval(() => {
        nextSlide();
      }, 5000); // 每5秒切换一次
    }
    
    function resetAutoplay() {
      clearInterval(autoplayInterval);
      startAutoplay();
    }
    
    // 当用户在轮播上悬停时，暂停自动播放
    carousel.addEventListener('mouseenter', () => {
      clearInterval(autoplayInterval);
    });
    
    carousel.addEventListener('mouseleave', () => {
      startAutoplay();
    });
    
    // 滚动事件，更新当前幻灯片索引
    carousel.addEventListener('scroll', () => {
      const scrollPosition = carousel.scrollLeft;
      const newIndex = Math.round(scrollPosition / slideWidth);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < slideCount) {
        currentIndex = newIndex;
        updateDots();
      }
    });
    
    // 初始设置轮播项的样式
    carousel.style.cursor = 'grab';
    
    // 初始化自动播放
    startAutoplay();
  }

  // Call initialization functions
  initAnimationStyles();
  animateOnScroll();
  setupMobileMenu();
  setupCarousels(); // 初始化轮播功能
  
  // Listen for scroll events
  window.addEventListener('scroll', animateOnScroll);
  
  // Listen for window resize,使用防抖动来优化性能
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      setupMobileMenu();
    }, 250);
  });
}); 