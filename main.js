// ==========================================
// META CANIS - INTERACTIVE SITE ENGINE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initNavbarScroll();
  initChartAnimation();
  initROICalculator();
  initFAQAccordion();
  initLeadForm();
});

/**
 * 1. Aesthetic Mouse Cursor Glow Tracker
 */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  window.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

/**
 * 2. Sticky Navbar Scroll styling
 */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(3, 7, 18, 0.85)';
      navbar.style.padding = '0.5rem 0';
      navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    } else {
      navbar.style.background = 'rgba(3, 7, 18, 0.5)';
      navbar.style.padding = '0';
      navbar.style.boxShadow = 'none';
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger initial state
}

/**
 * 3. Animated Dashboard Chart on Viewport Enter
 */
function initChartAnimation() {
  const bars = document.querySelectorAll('.chart-bar');
  if (bars.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Trigger transitions by setting scaleY on the fills
        bars.forEach((bar, index) => {
          const fill = bar.querySelector('.bar-fill');
          if (fill) {
            setTimeout(() => {
              bar.classList.add('active');
              fill.style.transform = 'scaleY(1)';
            }, index * 150); // Stagger animation
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  // Observe the bar chart container
  const chart = document.querySelector('.bar-chart');
  if (chart) observer.observe(chart);
}

/**
 * 4. Interactive ROI & Performance Calculator
 */
function initROICalculator() {
  const inputInvest = document.getElementById('input-invest');
  const inputCpl = document.getElementById('input-cpl');
  
  const valInvest = document.getElementById('val-invest');
  const valCpl = document.getElementById('val-cpl');
  
  const resLeads = document.getElementById('res-leads');
  const resRevenue = document.getElementById('res-revenue');

  if (!inputInvest || !inputCpl) return;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(val);
  };

  const calculate = () => {
    const investment = parseFloat(inputInvest.value);
    const cpl = parseFloat(inputCpl.value);
    
    // Update display values
    valInvest.textContent = formatCurrency(investment);
    valCpl.textContent = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(cpl);

    // Calculate outputs
    const leads = Math.round(investment / cpl);
    
    // Core brand metric: Meta Canis averages 4.5x ROAS
    const roas = 4.5;
    const revenue = investment * roas;

    // Display formatted outputs
    resLeads.textContent = new Intl.NumberFormat('pt-BR').format(leads);
    resRevenue.textContent = formatCurrency(revenue);
  };

  inputInvest.addEventListener('input', calculate);
  inputCpl.addEventListener('input', calculate);
  
  calculate(); // Perform initial run
}

/**
 * 5. Interactive Accordion (FAQ)
 */
function initFAQAccordion() {
  const headers = document.querySelectorAll('.accordion-header');
  
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isActive = item.classList.contains('active');

      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherContent = otherItem.querySelector('.accordion-content');
        if (otherContent) otherContent.style.maxHeight = null;
      });

      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = `${content.scrollHeight + 24}px`; // adding padding offset
      }
    });
  });
}

/**
 * 6. Capture Form Handler with Dynamic Validation & Success State
 */
function initLeadForm() {
  const form = document.getElementById('lead-form');
  const successBox = document.getElementById('form-success');

  if (!form || !successBox) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Fetch form data (mock submission)
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    console.log('Lead Capturado:', { name, email, phone });

    // CSS transition feedback
    form.style.opacity = '0';
    form.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
      form.classList.add('hidden');
      successBox.classList.remove('hidden');
      successBox.style.opacity = '0';
      successBox.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        successBox.style.opacity = '1';
      }, 50);
    }, 300);
  });
}
