// Blog page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const blogPosts = document.querySelectorAll('.blog-post');
    const loadMoreBtn = document.getElementById('loadMore');

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value.toLowerCase();
            filterPosts(searchTerm, getActiveCategory());
        }, 300));
    }

    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter posts
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            filterPosts(searchTerm, category);
        });
    });

    // Filter posts function
    function filterPosts(searchTerm, category) {
        blogPosts.forEach(post => {
            const title = post.querySelector('h3').textContent.toLowerCase();
            const content = post.querySelector('p').textContent.toLowerCase();
            const postCategory = post.getAttribute('data-category');
            
            const matchesSearch = !searchTerm || title.includes(searchTerm) || content.includes(searchTerm);
            const matchesCategory = category === 'all' || postCategory === category;
            
            if (matchesSearch && matchesCategory) {
                post.style.display = 'block';
                setTimeout(() => {
                    post.style.opacity = '1';
                    post.style.transform = 'translateY(0)';
                }, 100);
            } else {
                post.style.opacity = '0';
                post.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    post.style.display = 'none';
                }, 300);
            }
        });
    }

    // Get active category
    function getActiveCategory() {
        const activeBtn = document.querySelector('.category-btn.active');
        return activeBtn ? activeBtn.getAttribute('data-category') : 'all';
    }

    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more posts
            this.textContent = 'Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                // In a real application, you would load more posts here
                this.textContent = 'No more articles';
                this.disabled = true;
            }, 2000);
        });
    }

    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            
            if (email) {
                submitBtn.textContent = 'Subscribing...';
                submitBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    alert('Thank you for subscribing!');
                    this.reset();
                    submitBtn.textContent = 'Subscribe';
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    }

    // Animate blog posts on scroll
    const postObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    blogPosts.forEach(post => {
        post.style.opacity = '0';
        post.style.transform = 'translateY(30px)';
        post.style.transition = 'all 0.6s ease';
        postObserver.observe(post);
    });
});

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
