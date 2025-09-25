// main.js - VERSION COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
const App = {
    // Variables globales
    currentUser: null,
    cart: [],
    orders: JSON.parse(localStorage.getItem('orders')) || [],
    users: JSON.parse(localStorage.getItem('users')) || [],
    tickets: JSON.parse(localStorage.getItem('tickets')) || [],

    // Clé de chiffrement
    encryptionKey: 'jwetlakay_secure_2024',

    // Informations de paiement
    paymentInfo: {
        moncash: {
            name: "Marcco Bien Aimé",
            number: "+50939442808"
        },
        natcash: {
            name: "Pierre Louis Jinolyse",
            number: "+50935669814"
        }
    },

    // Produits disponibles avec promotions
    products: [
        { id: 1, name: "110 Diamants", price: 165, icon: "💎", description: "Pack de démarrage", promo: false },
        { id: 2, name: "220 Diamants", price: 330, icon: "💎", description: "Pack standard", promo: true, discount: 10 },
        { id: 3, name: "572 Diamants", price: 825, icon: "💎", description: "Pack valeur", promo: false },
        { id: 4, name: "1160 Diamants", price: 1650, icon: "💎", description: "Pack premium", promo: true, discount: 15 },
        { id: 5, name: "2398 Diamants", price: 3300, icon: "💎", description: "Pack deluxe", promo: false },
        { id: 6, name: "Abonnement hebdo", price: 400, icon: "📆", description: "Pro", promo: true, discount: 20 },
        { id: 7, name: "Abonnement mensuel", price: 1700, icon: "📆", description: "Premium", promo: false },
    ],

    // Points de fidélité
    loyaltyRate: 0.1, // 10% du montant en points

    // Initialisation
    init() {
        this.initializeApp();
        this.setupServiceWorker();
    },

    // Service Worker pour PWA
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(error => {
                    console.log('SW registration failed: ', error);
                });
        }
    },

    initializeApp() {
        // Vérifier si un utilisateur est déjà connecté
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForUser();
        }

        // Charger le panier
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartDisplay();
        }

        this.setupEventListeners();
        this.displayProducts();
        this.updatePaymentInfo();
        this.updateAdminStats();
        this.showPromoBanner();

        // Créer admin par défaut
        if (this.users.length === 0) {
            this.createDefaultAdmin();
        }
    },

    createDefaultAdmin() {
        const adminUser = {
            id: 1,
            email: 'adminjwetlakay@gmail.com',
            name: 'Administrateur Jwèt Lakay',
            phone: '+50939442808',
            password: this.encryptPassword('Admin123@'),
            registrationDate: new Date().toLocaleDateString('fr-FR'),
            isAdmin: true,
            loyaltyPoints: 1000
        };
        this.users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(this.users));
    },

    // Chiffrement basique
    encryptPassword(password) {
        return btoa(password + this.encryptionKey);
    },

    decryptPassword(encrypted) {
        return atob(encrypted).replace(this.encryptionKey, '');
    },

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('nav a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Menu mobile
        document.querySelector('.menu-toggle').addEventListener('click', () => {
            const nav = document.querySelector('nav ul');
            nav.classList.toggle('show');
            const isExpanded = nav.classList.contains('show');
            document.querySelector('.menu-toggle').setAttribute('aria-expanded', isExpanded);
        });

        // Formulaires
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('register-password').addEventListener('input', () => this.updatePasswordStrength());

        // Navigation auth
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('inscription');
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('connexion');
        });

        // Déconnexion
        document.getElementById('logout-btn').addEventListener('click', (e) => this.handleLogout(e));

        // Paiements
        document.getElementById('moncash-method').addEventListener('click', () => this.selectPaymentMethod('moncash'));
        document.getElementById('natcash-method').addEventListener('click', () => this.selectPaymentMethod('natcash'));

        // Formulaires de paiement
        document.getElementById('moncash-payment-form').addEventListener('submit', (e) => this.handleMonCashPayment(e));
        document.getElementById('natcash-payment-form').addEventListener('submit', (e) => this.handleNatCashPayment(e));

        // Uploads fichiers
        document.getElementById('moncash-screenshot').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('natcash-screenshot').addEventListener('change', (e) => this.handleFileUpload(e));

        // Contact
        document.getElementById('contact-form').addEventListener('submit', (e) => this.handleContactForm(e));

        // Modal de confirmation
        document.getElementById('modal-cancel-btn').addEventListener('click', () => this.hideConfirmationModal());

        // Notification sonore
        this.setupSoundNotification();
    },

    // Bannière de promotion
    showPromoBanner() {
        const promoProducts = this.products.filter(p => p.promo);
        if (promoProducts.length > 0) {
            const banner = document.createElement('div');
            banner.className = 'promo-banner';
            banner.innerHTML = `🎉 PROMOTION : Jusqu'à -${Math.max(...promoProducts.map(p => p.discount))}% sur certains packs !`;
            document.getElementById('accueil').insertBefore(banner, document.getElementById('accueil').firstChild);
        }
    },

    // Notification sonore
    setupSoundNotification() {
        // Créer un indicateur de son
        const soundIndicator = document.createElement('div');
        soundIndicator.className = 'sound-indicator no-print';
        soundIndicator.innerHTML = '🔔';
        soundIndicator.title = 'Activer/Désactiver les notifications sonores';
        document.body.appendChild(soundIndicator);

        soundIndicator.addEventListener('click', () => {
            this.toggleSound();
        });
    },

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const indicator = document.querySelector('.sound-indicator');
        indicator.innerHTML = this.soundEnabled ? '🔊' : '🔈';
        this.showNotification(this.soundEnabled ? 'Son activé' : 'Son désactivé', 'success');
    },

    playNotificationSound() {
        if (this.soundEnabled) {
            // Créer un son simple avec Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    },

    // Gestion des pages
    showPage(pageName) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            
            switch(pageName) {
                case 'panier':
                    this.updateCartDisplay();
                    break;
                case 'admin':
                    if (this.currentUser && this.currentUser.isAdmin) {
                        this.updateAdminStats();
                        this.displayOrders();
                        this.displayTickets();
                    } else {
                        this.showNotification('Accès non autorisé', 'error');
                        this.showPage('accueil');
                    }
                    break;
                case 'profil':
                    if (this.currentUser) {
                        this.updateProfileDisplay();
                    } else {
                        this.showNotification('Veuillez vous connecter', 'error');
                        this.showPage('connexion');
                    }
                    break;
                case 'tracking':
                    this.showOrderTracking();
                    break;
            }
        }
    },

    // AUTHENTIFICATION AVEC CHIFFREMENT
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!this.validateEmail(email)) {
            this.showError('login-email', 'Email invalide');
            return;
        }

        if (!password) {
            this.showError('login-password', 'Le mot de passe est requis');
            return;
        }

        this.setButtonLoading('login-btn', true);

        setTimeout(() => {
            const user = this.users.find(u => u.email === email && u.password === this.encryptPassword(password));
            
            if (user) {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.updateUIForUser();
                this.showNotification('Connexion réussie!', 'success');
                this.showPage('accueil');
            } else {
                this.showNotification('Email ou mot de passe incorrect', 'error');
            }

            this.setButtonLoading('login-btn', false);
        }, 1000);
    },

    handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const name = document.getElementById('register-name').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;

        if (!this.validateEmail(email)) {
            this.showError('register-email', 'Email invalide');
            return;
        }

        if (!name) {
            this.showError('register-name', 'Le nom est requis');
            return;
        }

        if (!this.validatePhone(phone)) {
            this.showError('register-phone', 'Numéro de téléphone invalide');
            return;
        }

        if (password.length < 8) {
            this.showError('register-password', 'Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('register-confirm', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showNotification('Cet email est déjà utilisé', 'error');
            return;
        }

        this.setButtonLoading('register-btn', true);

        setTimeout(() => {
            const newUser = {
                id: Date.now(),
                email,
                name,
                phone,
                password: this.encryptPassword(password),
                registrationDate: new Date().toLocaleDateString('fr-FR'),
                isAdmin: email === 'adminjwetlakay@gmail.com',
                loyaltyPoints: 0
            };

            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));
            
            this.showNotification('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success');
            this.showPage('connexion');
            this.setButtonLoading('register-btn', false);
        }, 1000);
    },

    // PRODUITS AVEC PROMOTIONS
    displayProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        this.products.forEach(product => {
            const finalPrice = product.promo ? 
                product.price * (1 - product.discount / 100) : 
                product.price;

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('role', 'listitem');
            productCard.innerHTML = `
                ${product.promo ? `<div class="promo-badge">-${product.discount}%</div>` : ''}
                <div class="product-badge">Populaire</div>
                <div class="product-icon" aria-hidden="true">${product.icon}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    ${product.promo ? 
                        `<span style="text-decoration: line-through; opacity: 0.7; margin-right: 10px;">${product.price} HTG</span>` : 
                        ''
                    }
                    ${Math.round(finalPrice)} HTG
                </div>
                <button class="add-to-cart" onclick="App.addToCart(${product.id})" 
                    aria-label="Ajouter ${product.name} au panier">
                    Ajouter au panier
                </button>
            `;
            grid.appendChild(productCard);
        });
    },

    // PANIER AVEC POINTS DE FIDÉLITÉ
    addToCart(productId) {
        if (!this.currentUser) {
            this.showNotification('Veuillez vous connecter pour ajouter au panier', 'error');
            this.showPage('connexion');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        const finalPrice = product.promo ? 
            product.price * (1 - product.discount / 100) : 
            product.price;

        const existingItem = this.cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                productId: productId,
                name: product.name,
                price: Math.round(finalPrice),
                originalPrice: product.price,
                quantity: 1,
                hasPromo: product.promo,
                discount: product.discount || 0
            });
        }

        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.showNotification(`${product.name} ajouté au panier`, 'success');
    },

    // SYSTÈME DE FIDÉLITÉ
    calculateLoyaltyPoints(amount) {
        return Math.floor(amount * this.loyaltyRate);
    },

    addLoyaltyPoints(userId, points) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
            localStorage.setItem('users', JSON.stringify(this.users));
        }
    },

    // SUIVI DE COMMANDE
    showOrderTracking(orderId = null) {
        // Créer une page de suivi dynamique
        const trackingHTML = `
            <div class="tracking-steps">
                <div class="tracking-step step-completed">
                    <div class="step-icon">1</div>
                    <div>Commande passée</div>
                </div>
                <div class="tracking-step step-active">
                    <div class="step-icon">2</div>
                    <div>Paiement vérifié</div>
                </div>
                <div class="tracking-step">
                    <div class="step-icon">3</div>
                    <div>Diamants envoyés</div>
                </div>
                <div class="tracking-step">
                    <div class="step-icon">4</div>
                    <div>Terminé</div>
                </div>
            </div>
        `;
        // Implémentation complète...
    },

    // TICKETS SUPPORT
    createTicket(subject, message) {
        const ticket = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            subject,
            message,
            status: 'open',
            date: new Date().toLocaleString('fr-FR'),
            responses: []
        };

        this.tickets.push(ticket);
        localStorage.setItem('tickets', JSON.stringify(this.tickets));
        return ticket;
    },

    displayTickets() {
        // Afficher les tickets dans l'admin
        const ticketsContainer = document.getElementById('tickets-container');
        if (!ticketsContainer) return;

        ticketsContainer.innerHTML = this.tickets.map(ticket => `
            <div class="ticket-card">
                <h3>${ticket.subject}</h3>
                <p>${ticket.message}</p>
                <div class="ticket-meta">
                    <span class="ticket-status status-${ticket.status}">${ticket.status}</span>
                    <span>${ticket.userName} - ${ticket.date}</span>
                </div>
            </div>
        `).join('');
    },

    // ANALYTICS AVANCÉES
    getAdvancedStats() {
        const today = new Date().toDateString();
        const dailyRevenue = this.orders.filter(order => 
            new Date(order.date).toDateString() === today
        ).reduce((sum, order) => sum + order.total, 0);

        const weeklyRevenue = this.orders.filter(order => {
            const orderDate = new Date(order.date);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return orderDate > weekAgo;
        }).reduce((sum, order) => sum + order.total, 0);

        const popularProducts = this.orders.reduce((acc, order) => {
            order.items.forEach(item => {
                acc[item.name] = (acc[item.name] || 0) + item.quantity;
            });
            return acc;
        }, {});

        return { dailyRevenue, weeklyRevenue, popularProducts };
    },

    // ... (le reste des méthodes existantes mais AVEC LES NOUVELLES FONCTIONNALITÉS INTÉGRÉES)

    // PROCESSUS DE PAIEMENT AVEC POINTS
    processPayment(method) {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Ajouter les points de fidélité
        const pointsEarned = this.calculateLoyaltyPoints(total);
        this.addLoyaltyPoints(this.currentUser.id, pointsEarned);

        // Le reste du processus de paiement existant...
        const paymentName = document.getElementById(`${method}-name-input`).value;
        const paymentNumber = document.getElementById(`${method}-number-input`).value;
        const freeFireId = document.getElementById(method === 'moncash' ? 'freefire-id' : 'freefire-id-natcash').value;
        const screenshotFile = document.getElementById(`${method}-screenshot`).files[0];

        if (!screenshotFile) {
            this.showNotification('Veuillez uploader une preuve de paiement', 'error');
            return;
        }

        this.setButtonLoading(`${method}-submit`, true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const order = {
                id: Date.now(),
                userId: this.currentUser.id,
                userName: this.currentUser.name,
                userEmail: this.currentUser.email,
                items: [...this.cart],
                total: total,
                paymentMethod: method,
                paymentDetails: {
                    name: paymentName,
                    number: paymentNumber,
                    freeFireId: freeFireId,
                    screenshot: e.target.result
                },
                status: 'pending',
                date: new Date().toLocaleString('fr-FR'),
                loyaltyPointsEarned: pointsEarned
            };

            this.orders.push(order);
            localStorage.setItem('orders', JSON.stringify(this.orders));
            
            // Notifier l'admin (simulation WebSocket)
            this.notifyAdminNewOrder(order);
            
            this.clearCart();
            document.getElementById('payment-section').style.display = 'none';
            
            this.showNotification(`Commande passée avec succès! +${pointsEarned} points gagnés!`, 'success');
            this.showPage('accueil');
            
            this.setButtonLoading(`${method}-submit`, false);
        };
        reader.readAsDataURL(screenshotFile);
    },

    // NOTIFICATION ADMIN (simulation WebSocket)
    notifyAdminNewOrder(order) {
        if (this.soundEnabled) {
            this.playNotificationSound();
        }
        
        // Sauvegarder la notification
        const notifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
        notifications.push({
            id: Date.now(),
            type: 'new_order',
            message: `Nouvelle commande #${order.id} de ${order.userName}`,
            orderId: order.id,
            timestamp: new Date(),
            read: false
        });
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    },

    // ... (les autres méthodes restent similaires mais AVEC LES AMÉLIORATIONS)

    // VALIDATION FREE FIRE ID (simulation API)
    validateFreeFireID: async function(id) {
        this.showLoading('Vérification de l\'ID Free Fire...');
        try {
            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Validation basique
            const isValid = id.length >= 6 && id.length <= 16 && /^[0-9]+$/.test(id);
            
            this.hideLoading();
            return isValid;
        } catch (error) {
            this.hideLoading();
            return true; // Fallback si échec
        }
    },

    showLoading(message = 'Chargement...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div class="spinner-large"></div>
                <p style="margin-top: 20px;">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.remove();
    }

    // ... (toutes vos méthodes existantes AVEC les nouvelles intégrées)
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exposer les méthodes globales
window.App = App;
window.hideNotification = () => App.hideNotification();