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
      const mailtoLink = `mailto:gosomatu@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      
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
    let isScrollSnapping = false;
    let lastDragTime = 0;
    let lastDragPosition = 0;
    let dragVelocity = 0;
    
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
      
      isScrollSnapping = true;
      carousel.scrollTo({
        left: scrollPosition,
        behavior: smooth ? 'smooth' : 'auto'
      });
      
      // 在平滑滚动结束后重置标志
      if (smooth) {
        setTimeout(() => {
          isScrollSnapping = false;
        }, 300); // 假设平滑滚动持续300ms
      } else {
        isScrollSnapping = false;
      }
      
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
    
    // 处理鼠标拖拽开始
    function handleDragStart(e) {
      if (isScrollSnapping) return;
      
      isDragging = true;
      startPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      startScrollLeft = carousel.scrollLeft;
      lastDragPosition = startPosition;
      lastDragTime = Date.now();
      dragVelocity = 0;
      
      carousel.style.cursor = 'grabbing';
      carousel.style.scrollBehavior = 'auto';
      carousel.classList.add('dragging');
      
      // 阻止默认行为，避免在触摸设备上滚动页面
      if (e.type.includes('touch')) {
        e.preventDefault();
      }
    }
    
    // 处理拖拽移动
    function handleDragMove(e) {
      if (!isDragging) return;
      
      const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const distance = currentPosition - startPosition;
      
      // 计算拖拽速度
      const now = Date.now();
      const timeElapsed = now - lastDragTime;
      
      if (timeElapsed > 0) {
        // 计算每毫秒移动的像素数
        dragVelocity = (currentPosition - lastDragPosition) / timeElapsed;
      }
      
      lastDragPosition = currentPosition;
      lastDragTime = now;
      
      // 应用阻尼效果，使拖动感觉更自然
      const dampingFactor = 1; // 可以调整这个值来控制阻尼强度
      const newScrollLeft = startScrollLeft - distance * dampingFactor;
      
      carousel.scrollLeft = newScrollLeft;
      
      // 防止页面滚动
      e.preventDefault();
    }
    
    // 处理拖拽结束
    function handleDragEnd(e) {
      if (!isDragging) return;
      
      isDragging = false;
      carousel.style.cursor = 'grab';
      carousel.classList.remove('dragging');
      
      // 根据拖拽速度决定滑动方向和距离
      const velocity = Math.abs(dragVelocity) > 0.5 ? dragVelocity : 0;
      const momentumDistance = velocity * 300; // 速度越大，惯性滑动越远
      
      let targetIndex;
      
      if (Math.abs(velocity) > 0.3) {
        // 高速拖拽时，根据方向决定下一张或上一张
        const direction = velocity < 0 ? 1 : -1;
        targetIndex = currentIndex + direction;
      } else {
        // 低速拖拽或点击时，根据当前位置计算最近的幻灯片
        targetIndex = Math.round(carousel.scrollLeft / slideWidth);
      }
      
      // 恢复平滑滚动
      carousel.style.scrollBehavior = 'smooth';
      goToSlide(targetIndex);
      resetAutoplay();
    }
    
    // 鼠标事件
    carousel.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    
    // 触摸事件
    carousel.addEventListener('touchstart', handleDragStart, {passive: false});
    carousel.addEventListener('touchmove', handleDragMove, {passive: false});
    carousel.addEventListener('touchend', handleDragEnd);
    
    carousel.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        carousel.style.cursor = 'grab';
        carousel.classList.remove('dragging');
      }
    });
    
    // 防止拖拽时选中文本
    carousel.addEventListener('selectstart', (e) => {
      if (isDragging) e.preventDefault();
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
      if (!isDragging) {
        startAutoplay();
      }
    });
    
    // 滚动事件，更新当前幻灯片索引
    carousel.addEventListener('scroll', () => {
      if (isScrollSnapping) return;
      
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