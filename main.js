// main.js - Version complète mise à jour pour Jwèt Lakay
const App = {
    // Variables globales
    currentUser: null,
    cart: [],
    orders: JSON.parse(localStorage.getItem('orders')) || [],
    users: JSON.parse(localStorage.getItem('users')) || [],

    // Informations de paiement mises à jour
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

    // Produits disponibles
    products: [
        { id: 1, name: "110 Diamants", price: 165, icon: "💎", description: "Pack de démarrage" },
        { id: 2, name: "220 Diamants", price: 330, icon: "💎", description: "Pack standard" },
        { id: 3, name: "572 Diamants", price: 825, icon: "💎", description: "Pack valeur" },
        { id: 4, name: "1160 Diamants", price: 1650, icon: "💎", description: "Pack premium" },
        { id: 5, name: "2398 Diamants", price: 3300, icon: "💎", description: "Pack deluxe" },
        { id: 6, name: "Abonnement hebdo", price: 400, icon: "📆", description: "Pro" },
        { id: 7, name: "Abonnement mensuel", price: 1700, icon: "📆", description: "Premium" },
    ],

    // Initialisation de l'application
    init() {
        this.initializeApp();
    },

    initializeApp() {
        // Vérifier si un utilisateur est déjà connecté
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForUser();
        }

        // Charger le panier depuis le localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartDisplay();
        }

        // Initialiser les écouteurs d'événements
        this.setupEventListeners();
        
        // Afficher les produits
        this.displayProducts();
        
        // Mettre à jour les informations de paiement dans l'interface
        this.updatePaymentInfo();
        
        // Mettre à jour les statistiques admin
        this.updateAdminStats();

        // Créer un utilisateur admin par défaut au premier chargement
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
            password: 'Admin123@',
            registrationDate: new Date().toLocaleDateString('fr-FR'),
            isAdmin: true
        };
        this.users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(this.users));
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

        // Formulaire de connexion
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));

        // Formulaire d'inscription
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('register-password').addEventListener('input', () => this.updatePasswordStrength());

        // Navigation entre connexion/inscription
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

        // Méthodes de paiement
        document.getElementById('moncash-method').addEventListener('click', () => {
            this.selectPaymentMethod('moncash');
        });

        document.getElementById('natcash-method').addEventListener('click', () => {
            this.selectPaymentMethod('natcash');
        });

        // Formulaires de paiement
        document.getElementById('moncash-payment-form').addEventListener('submit', (e) => this.handleMonCashPayment(e));
        document.getElementById('natcash-payment-form').addEventListener('submit', (e) => this.handleNatCashPayment(e));

        // Gestion des uploads de fichiers
        document.getElementById('moncash-screenshot').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('natcash-screenshot').addEventListener('change', (e) => this.handleFileUpload(e));

        // Formulaire de contact
        document.getElementById('contact-form').addEventListener('submit', (e) => this.handleContactForm(e));

        // Modal de confirmation
        document.getElementById('modal-cancel-btn').addEventListener('click', () => this.hideConfirmationModal());
    },

    // Mettre à jour les informations de paiement dans l'interface
    updatePaymentInfo() {
        // Mettre à jour MonCash
        document.getElementById('moncash-name').textContent = this.paymentInfo.moncash.name;
        document.getElementById('moncash-number').textContent = this.paymentInfo.moncash.number;
        
        // Mettre à jour NatCash
        document.getElementById('natcash-name').textContent = this.paymentInfo.natcash.name;
        document.getElementById('natcash-number').textContent = this.paymentInfo.natcash.number;
    },

    // Gestion de l'affichage des pages
    showPage(pageName) {
        // Masquer toutes les pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Afficher la page demandée
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Mettre à jour l'interface selon la page
            switch(pageName) {
                case 'panier':
                    this.updateCartDisplay();
                    break;
                case 'admin':
                    if (this.currentUser && this.currentUser.isAdmin) {
                        this.updateAdminStats();
                        this.displayOrders();
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
            }
        }
    },

    // Gestion de l'authentification
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Valider les champs
        if (!this.validateEmail(email)) {
            this.showError('login-email', 'Email invalide');
            return;
        }

        if (!password) {
            this.showError('login-password', 'Le mot de passe est requis');
            return;
        }

        this.setButtonLoading('login-btn', true);

        // Simuler un délai de traitement
        setTimeout(() => {
            // Vérifier les informations de connexion
            const user = this.users.find(u => u.email === email && u.password === password);
            
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

        // Validation des champs
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

        // Simuler un délai d'inscription
        setTimeout(() => {
            // Créer le nouvel utilisateur
            const newUser = {
                id: Date.now(),
                email,
                name,
                phone,
                password,
                registrationDate: new Date().toLocaleDateString('fr-FR'),
                isAdmin: email === 'adminjwetlakay@gmail.com'
            };

            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));
            
            this.showNotification('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success');
            this.showPage('connexion');
            this.setButtonLoading('register-btn', false);
        }, 1000);
    },

    handleLogout(e) {
        if (e) e.preventDefault();
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUIForUser();
        this.showNotification('Déconnexion réussie', 'success');
        this.showPage('connexion');
    },

    updateUIForUser() {
        const adminLink = document.querySelector('.admin-link');
        const logoutBtn = document.getElementById('logout-btn');

        if (this.currentUser) {
            // Masquer la connexion, afficher les autres pages
            this.showPage('accueil');
            if (this.currentUser.isAdmin) {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
            logoutBtn.style.display = 'block';
        } else {
            // Afficher la page de connexion
            this.showPage('connexion');
            adminLink.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    },

    // Gestion des produits
    displayProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        this.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('role', 'listitem');
            productCard.innerHTML = `
                <div class="product-badge">Populaire</div>
                <div class="product-icon" aria-hidden="true">${product.icon}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price} HTG</div>
                <button class="add-to-cart" onclick="App.addToCart(${product.id})" aria-label="Ajouter ${product.name} au panier">
                    Ajouter au panier
                </button>
            `;
            grid.appendChild(productCard);
        });
    },

    // Gestion du panier
    addToCart(productId) {
        if (!this.currentUser) {
            this.showNotification('Veuillez vous connecter pour ajouter au panier', 'error');
            this.showPage('connexion');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        const existingItem = this.cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.showNotification(`${product.name} ajouté au panier`, 'success');
    },

    updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        cartItems.innerHTML = '';
        let total = 0;

        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.setAttribute('role', 'listitem');
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <div class="cart-item-price">${item.price} HTG x ${item.quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="App.updateQuantity(${index}, -1)" aria-label="Réduire la quantité">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="App.updateQuantity(${index}, 1)" aria-label="Augmenter la quantité">+</button>
                    <button onclick="App.removeFromCart(${index})" class="btn-secondary">Supprimer</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        cartTotal.textContent = `Total: ${total} HTG`;

        // Mettre à jour les montants dans les formulaires de paiement
        document.getElementById('moncash-amount').value = total;
        document.getElementById('natcash-amount').value = total;
    },

    updateQuantity(index, change) {
        this.cart[index].quantity += change;
        
        if (this.cart[index].quantity <= 0) {
            this.cart.splice(index, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.showNotification('Article retiré du panier', 'success');
    },

    clearCart() {
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.showNotification('Panier vidé', 'success');
    },

    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Votre panier est vide', 'error');
            return;
        }

        document.getElementById('payment-section').style.display = 'block';
    },

    // Gestion des paiements
    selectPaymentMethod(method) {
        // Réinitialiser la sélection
        document.querySelectorAll('.payment-method').forEach(pm => {
            pm.classList.remove('active');
        });
        document.querySelectorAll('.payment-form').forEach(pf => {
            pf.style.display = 'none';
        });

        // Activer la méthode sélectionnée
        document.getElementById(`${method}-method`).classList.add('active');
        document.getElementById(`${method}-form`).style.display = 'block';
    },

    handleMonCashPayment(e) {
        e.preventDefault();
        this.processPayment('moncash');
    },

    handleNatCashPayment(e) {
        e.preventDefault();
        this.processPayment('natcash');
    },

    processPayment(method) {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Récupérer les informations du formulaire de paiement
        const paymentName = document.getElementById(`${method}-name-input`).value;
        const paymentNumber = document.getElementById(`${method}-number-input`).value;
        const freeFireId = document.getElementById(method === 'moncash' ? 'freefire-id' : 'freefire-id-natcash').value;
        const screenshotFile = document.getElementById(`${method}-screenshot`).files[0];

        if (!screenshotFile) {
            this.showNotification('Veuillez uploader une preuve de paiement', 'error');
            return;
        }

        // Désactiver le bouton pendant le traitement
        this.setButtonLoading(`${method}-submit`, true);

        // Convertir l'image en base64 pour le stockage
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
                date: new Date().toLocaleString('fr-FR')
            };

            this.orders.push(order);
            localStorage.setItem('orders', JSON.stringify(this.orders));
            
            // Vider le panier
            this.clearCart();
            
            // Cacher la section paiement
            document.getElementById('payment-section').style.display = 'none';
            
            this.showNotification('Commande passée avec succès! Nous traiterons votre demande rapidement.', 'success');
            this.showPage('accueil');
            
            this.setButtonLoading(`${method}-submit`, false);
        };
        reader.readAsDataURL(screenshotFile);
    },

    // Gestion de l'administration
    updateAdminStats() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);

        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('total-revenue').textContent = `${totalRevenue} HTG`;
    },

    displayOrders() {
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';

        this.orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>
                    <strong>${order.userName}</strong><br>
                    <small>${order.userEmail}</small>
                </td>
                <td>${order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</td>
                <td>${order.total} HTG</td>
                <td>${order.paymentMethod}</td>
                <td>${order.date}</td>
                <td>
                    <select onchange="App.updateOrderStatus(${order.id}, this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En traitement</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Terminé</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulé</option>
                    </select>
                </td>
                <td>
                    <button onclick="App.showOrderDetails(${order.id})" class="btn">Détails</button>
                    <button onclick="App.deleteOrder(${order.id})" class="btn-secondary">Supprimer</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: #1a2a6c;
                padding: 30px;
                border-radius: 10px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <h2 style="color: #ff9900; margin-bottom: 20px;">Détails de la commande #${order.id}</h2>
                
                <div class="order-details">
                    <div class="detail-section">
                        <h3 style="color: #ff9900;">Informations client</h3>
                        <p><strong>Nom:</strong> ${order.userName}</p>
                        <p><strong>Email:</strong> ${order.userEmail}</p>
                    </div>

                    <div class="detail-section">
                        <h3 style="color: #ff9900;">Détails de la commande</h3>
                        <p><strong>Total:</strong> ${order.total} HTG</p>
                        <p><strong>Méthode de paiement:</strong> ${order.paymentMethod}</p>
                        <p><strong>Date:</strong> ${order.date}</p>
                        <p><strong>Statut:</strong> ${this.getStatusText(order.status)}</p>
                    </div>

                    <div class="detail-section">
                        <h3 style="color: #ff9900;">Informations de paiement</h3>
                        <p><strong>Nom ${order.paymentMethod}:</strong> ${order.paymentDetails.name}</p>
                        <p><strong>Numéro ${order.paymentMethod}:</strong> ${order.paymentDetails.number}</p>
                        <p><strong>ID Free Fire:</strong> ${order.paymentDetails.freeFireId}</p>
                    </div>

                    <div class="detail-section">
                        <h3 style="color: #ff9900;">Preuve de paiement</h3>
                        <img src="${order.paymentDetails.screenshot}" alt="Preuve de paiement" style="
                            max-width: 100%;
                            border-radius: 5px;
                            margin-top: 10px;
                        ">
                    </div>

                    <div class="modal-actions" style="margin-top: 20px; text-align: center;">
                        <button onclick="this.closest('.modal').remove()" class="btn">Fermer</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer la modal en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    },

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            localStorage.setItem('orders', JSON.stringify(this.orders));
            this.updateAdminStats();
            this.displayOrders();
            this.showNotification('Statut de commande mis à jour', 'success');
        }
    },

    deleteOrder(orderId) {
        this.showConfirmationModal('Êtes-vous sûr de vouloir supprimer cette commande?', () => {
            this.orders = this.orders.filter(o => o.id !== orderId);
            localStorage.setItem('orders', JSON.stringify(this.orders));
            this.updateAdminStats();
            this.displayOrders();
            this.showNotification('Commande supprimée', 'success');
        });
    },

    exportOrders() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Client,Email,Produits,Montant,Méthode,Date,Statut\n"
            + this.orders.map(order => 
                `"${order.id}","${order.userName}","${order.userEmail}","${order.items.map(item => item.name).join(', ')}","${order.total}","${order.paymentMethod}","${order.date}","${order.status}"`
            ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "commandes_jwet_lakay.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Export des commandes réussi', 'success');
    },

    clearAllOrders() {
        this.showConfirmationModal('Êtes-vous sûr de vouloir supprimer toutes les commandes? Cette action est irréversible.', () => {
            this.orders = [];
            localStorage.setItem('orders', JSON.stringify(this.orders));
            this.updateAdminStats();
            this.displayOrders();
            this.showNotification('Toutes les commandes ont été supprimées', 'success');
        });
    },

    // Profil utilisateur
    updateProfileDisplay() {
        document.getElementById('profile-name').textContent = this.currentUser.name;
        document.getElementById('profile-email').textContent = this.currentUser.email;
        document.getElementById('profile-phone').textContent = this.currentUser.phone;
        document.getElementById('profile-date').textContent = this.currentUser.registrationDate;

        // Afficher l'historique des commandes
        const userOrders = this.orders.filter(order => order.userId === this.currentUser.id);
        const orderHistory = document.getElementById('order-history');
        
        if (userOrders.length === 0) {
            orderHistory.innerHTML = '<p style="text-align: center; margin-top: 20px;">Aucune commande passée pour le moment.</p>';
        } else {
            orderHistory.innerHTML = userOrders.map(order => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h3>Commande #${order.id}</h3>
                        <p>Date: ${order.date}</p>
                        <p>Total: ${order.total} HTG</p>
                        <p>Statut: ${this.getStatusText(order.status)}</p>
                    </div>
                </div>
            `).join('');
        }
    },

    // Utilitaires
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const re = /^\+?[\d\s-()]{10,}$/;
        return re.test(phone);
    },

    showError(fieldId, message) {
        const errorElement = document.getElementById(fieldId + '-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    hideError(fieldId) {
        const errorElement = document.getElementById(fieldId + '-error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    },

    setButtonLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (isLoading) {
                button.disabled = true;
                button.classList.add('loading');
            } else {
                button.disabled = false;
                button.classList.remove('loading');
            }
        }
    },

    updatePasswordStrength() {
        const password = document.getElementById('register-password').value;
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;

        const strengthValue = Math.min(strength * 25, 100);
        strengthBar.className = 'strength-bar';
        strengthBar.setAttribute('aria-valuenow', strengthValue);
        
        if (password.length === 0) {
            strengthText.textContent = 'Force du mot de passe: Non évalué';
            strengthBar.style.setProperty('--strength-width', '0%');
        } else if (strength <= 2) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Force du mot de passe: Faible';
            strengthBar.style.setProperty('--strength-width', '33%');
        } else if (strength === 3) {
            strengthBar.classList.add('medium');
            strengthText.textContent = 'Force du mot de passe: Moyenne';
            strengthBar.style.setProperty('--strength-width', '66%');
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Force du mot de passe: Forte';
            strengthBar.style.setProperty('--strength-width', '100%');
        }
    },

    handleFileUpload(e) {
        const file = e.target.files[0];
        const fileInfo = document.getElementById(e.target.id + '-info');
        
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
                e.target.value = '';
                fileInfo.textContent = '';
            } else {
                fileInfo.textContent = `Fichier sélectionné: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            }
        }
    },

    handleContactForm(e) {
        e.preventDefault();
        
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;

        this.setButtonLoading('contact-form button', true);

        // Simuler l'envoi du message
        setTimeout(() => {
            this.showNotification('Votre message a été envoyé! Nous vous répondrons dans les plus brefs délais.', 'success');
            e.target.reset();
            this.setButtonLoading('contact-form button', false);
        }, 1000);
    },

    showConfirmationModal(message, confirmCallback) {
        const modal = document.getElementById('confirmation-modal');
        const messageEl = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');

        messageEl.textContent = message;
        modal.style.display = 'flex';

        // Nettoyer les écouteurs précédents
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // Nouveaux écouteurs
        newConfirmBtn.addEventListener('click', () => {
            confirmCallback();
            this.hideConfirmationModal();
        });

        newCancelBtn.addEventListener('click', () => this.hideConfirmationModal());
    },

    hideConfirmationModal() {
        document.getElementById('confirmation-modal').style.display = 'none';
    },

    getStatusText(status) {
        const statusMap = {
            'pending': 'En attente',
            'processing': 'En traitement',
            'completed': 'Terminé',
            'cancelled': 'Annulé'
        };
        return statusMap[status] || status;
    },

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notification-message');
        
        messageEl.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';
        
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    },

    hideNotification() {
        document.getElementById('notification').style.display = 'none';
    }
};

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exposer les méthodes globales pour l'HTML
window.App = App;
window.hideNotification = () => App.hideNotification();