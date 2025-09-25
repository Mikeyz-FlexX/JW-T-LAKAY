// main.js - Logique de l'application Jwèt Lakay (Version corrigée)

// Variables globales
let currentUser = null;
let cart = [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// Informations de paiement mises à jour
const paymentInfo = {
    moncash: {
        name: "Marcco Bien Aimé",
        number: "+50939442808"
    },
    natcash: {
        name: "Pierre Louis Jinolyse",
        number: "+50935669814"
    }
};

// Produits disponibles
const products = [
    { id: 1, name: "110 Diamants", price: 165, icon: "💎", description: "Pack de démarrage" },
    { id: 2, name: "220 Diamants", price: 330, icon: "💎", description: "Pack standard" },
    { id: 3, name: "572 Diamants", price: 825, icon: "💎", description: "Pack valeur" },
    { id: 4, name: "1160 Diamants", price: 1650, icon: "💎", description: "Pack premium" },
    { id: 5, name: "2398 Diamants", price: 3300, icon: "💎", description: "Pack deluxe" },
    { id: 6, name: "Abonnement hebdo", price: 400, icon: "📆", description: "Pro" },
    { id: 7, name: "Abonnement mensuel", price: 1700, icon: "📆", description: "Premium" },
];

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Vérifier si un utilisateur est déjà connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForUser();
    }

    // Charger le panier depuis le localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }

    // Initialiser les écouteurs d'événements
    setupEventListeners();
    
    // Afficher les produits
    displayProducts();
    
    // Mettre à jour les informations de paiement dans l'interface
    updatePaymentInfo();
    
    // Mettre à jour les statistiques admin
    updateAdminStats();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('nav a[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    // Menu mobile
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        document.querySelector('nav ul').classList.toggle('show');
    });

    // Formulaire de connexion
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Formulaire d'inscription
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('register-password').addEventListener('input', updatePasswordStrength);

    // Navigation entre connexion/inscription
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('inscription');
    });

    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('connexion');
    });

    // Déconnexion
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Méthodes de paiement
    document.getElementById('moncash-method').addEventListener('click', function() {
        selectPaymentMethod('moncash');
    });

    document.getElementById('natcash-method').addEventListener('click', function() {
        selectPaymentMethod('natcash');
    });

    // Formulaires de paiement
    document.getElementById('moncash-payment-form').addEventListener('submit', handleMonCashPayment);
    document.getElementById('natcash-payment-form').addEventListener('submit', handleNatCashPayment);

    // Gestion des uploads de fichiers
    document.getElementById('moncash-screenshot').addEventListener('change', handleFileUpload);
    document.getElementById('natcash-screenshot').addEventListener('change', handleFileUpload);

    // Formulaire de contact
    document.getElementById('contact-form').addEventListener('submit', handleContactForm);
}

// Mettre à jour les informations de paiement dans l'interface
function updatePaymentInfo() {
    // Mettre à jour MonCash
    document.querySelector('#moncash-method .payment-info').innerHTML = `
        <p><strong>Numéro:</strong> ${paymentInfo.moncash.number}</p>
        <p><strong>Nom:</strong> ${paymentInfo.moncash.name}</p>
    `;
    
    // Mettre à jour NatCash
    document.querySelector('#natcash-method .payment-info').innerHTML = `
        <p><strong>Numéro:</strong> ${paymentInfo.natcash.number}</p>
        <p><strong>Nom:</strong> ${paymentInfo.natcash.name}</p>
    `;
}

// Gestion de l'affichage des pages
function showPage(pageName) {
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
                updateCartDisplay();
                break;
            case 'admin':
                if (currentUser && currentUser.isAdmin) {
                    updateAdminStats();
                    displayOrders();
                } else {
                    showNotification('Accès non autorisé', 'error');
                    showPage('accueil');
                }
                break;
            case 'profil':
                if (currentUser) {
                    updateProfileDisplay();
                } else {
                    showNotification('Veuillez vous connecter', 'error');
                    showPage('connexion');
                }
                break;
        }
    }
}

// Gestion de l'authentification
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Vérifier les informations de connexion
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForUser();
        showNotification('Connexion réussie!', 'success');
        showPage('accueil');
    } else {
        showNotification('Email ou mot de passe incorrect', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    // Vérifications
    if (password !== confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    if (users.find(u => u.email === email)) {
        showNotification('Cet email est déjà utilisé', 'error');
        return;
    }

    // Créer le nouvel utilisateur
    const newUser = {
        id: Date.now(),
        email,
        name,
        phone,
        password,
        registrationDate: new Date().toLocaleDateString('fr-FR'),
        isAdmin: email === 'adminjwetlakay@gmail.com' // Admin spécifique
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success');
    showPage('connexion');
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
    showNotification('Déconnexion réussie', 'success');
    showPage('connexion');
}

function updateUIForUser() {
    const adminLink = document.querySelector('.admin-link');
    const logoutBtn = document.getElementById('logout-btn');

    if (currentUser) {
        // Masquer la connexion, afficher les autres pages
        showPage('accueil');
        if (currentUser.isAdmin) {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
        logoutBtn.style.display = 'block';
    } else {
        // Afficher la page de connexion
        showPage('connexion');
        adminLink.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

// Gestion des produits
function displayProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-badge">Populaire</div>
            <div class="product-icon">${product.icon}</div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${product.price} HTG</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Ajouter au panier
            </button>
        `;
        grid.appendChild(productCard);
    });
}

// Gestion du panier
function addToCart(productId) {
    if (!currentUser) {
        showNotification('Veuillez vous connecter pour ajouter au panier', 'error');
        showPage('connexion');
        return;
    }

    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification(`${product.name} ajouté au panier`, 'success');
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="cart-item-price">${item.price} HTG x ${item.quantity}</div>
            </div>
            <div class="cart-item-actions">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button onclick="removeFromCart(${index})" class="btn-secondary">Supprimer</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = `Total: ${total} HTG`;

    // Mettre à jour les montants dans les formulaires de paiement
    document.getElementById('moncash-amount').value = total;
    document.getElementById('natcash-amount').value = total;
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Article retiré du panier', 'success');
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Panier vidé', 'success');
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'error');
        return;
    }

    document.getElementById('payment-section').style.display = 'block';
}

// Gestion des paiements
function selectPaymentMethod(method) {
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
}

function handleMonCashPayment(e) {
    e.preventDefault();
    processPayment('moncash');
}

function handleNatCashPayment(e) {
    e.preventDefault();
    processPayment('natcash');
}

function processPayment(method) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Récupérer les informations du formulaire de paiement
    const paymentName = document.getElementById(`${method}-name`).value;
    const paymentNumber = document.getElementById(`${method}-number`).value;
    const freeFireId = document.getElementById(method === 'moncash' ? 'freefire-id' : 'freefire-id-natcash').value;
    const screenshotFile = document.getElementById(`${method}-screenshot`).files[0];

    if (!screenshotFile) {
        showNotification('Veuillez uploader une preuve de paiement', 'error');
        return;
    }

    // Convertir l'image en base64 pour le stockage
    const reader = new FileReader();
    reader.onload = function(e) {
        const order = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            items: [...cart],
            total: total,
            paymentMethod: method,
            paymentDetails: {
                name: paymentName,
                number: paymentNumber,
                freeFireId: freeFireId,
                screenshot: e.target.result // Stocker l'image en base64
            },
            status: 'pending',
            date: new Date().toLocaleString('fr-FR')
        };

        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Vider le panier
        clearCart();
        
        // Cacher la section paiement
        document.getElementById('payment-section').style.display = 'none';
        
        showNotification('Commande passée avec succès! Nous traiterons votre demande rapidement.', 'success');
        showPage('accueil');
    };
    reader.readAsDataURL(screenshotFile);
}

// Gestion de l'administration
function updateAdminStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('total-revenue').textContent = `${totalRevenue} HTG`;
}

function displayOrders() {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';

    // Afficher toutes les commandes (pas seulement en attente)
    orders.forEach(order => {
        const user = users.find(u => u.id === order.userId);
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
                <select onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En traitement</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Terminé</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulé</option>
                </select>
            </td>
            <td>
                <button onclick="showOrderDetails(${order.id})" class="btn">Détails</button>
                <button onclick="deleteOrder(${order.id})" class="btn-secondary">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Créer une modal pour afficher les détails
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
                    <p><strong>Statut:</strong> ${getStatusText(order.status)}</p>
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
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        updateAdminStats();
        displayOrders();
        showNotification('Statut de commande mis à jour', 'success');
    }
}

function deleteOrder(orderId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande?')) {
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(orders));
        updateAdminStats();
        displayOrders();
        showNotification('Commande supprimée', 'success');
    }
}

function exportOrders() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Client,Email,Produits,Montant,Méthode,Date,Statut\n"
        + orders.map(order => 
            `"${order.id}","${order.userName}","${order.userEmail}","${order.items.map(item => item.name).join(', ')}","${order.total}","${order.paymentMethod}","${order.date}","${order.status}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "commandes_jwet_lakay.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllOrders() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les commandes? Cette action est irréversible.')) {
        orders = [];
        localStorage.setItem('orders', JSON.stringify(orders));
        updateAdminStats();
        displayOrders();
        showNotification('Toutes les commandes ont été supprimées', 'success');
    }
}

// Profil utilisateur
function updateProfileDisplay() {
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-phone').textContent = currentUser.phone;
    document.getElementById('profile-date').textContent = currentUser.registrationDate;

    // Afficher l'historique des commandes
    const userOrders = orders.filter(order => order.userId === currentUser.id);
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
                    <p>Statut: ${getStatusText(order.status)}</p>
                </div>
            </div>
        `).join('');
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'En attente',
        'processing': 'En traitement',
        'completed': 'Terminé',
        'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
}

// Utilitaires
function updatePasswordStrength() {
    const password = document.getElementById('register-password').value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    strengthBar.className = 'strength-bar';
    if (strength === 0) {
        strengthText.textContent = 'Force du mot de passe: Faible';
    } else if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Force du mot de passe: Faible';
    } else if (strength === 3) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Force du mot de passe: Moyenne';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Force du mot de passe: Forte';
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    const fileInfo = document.getElementById(e.target.id + '-info');
    
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB max
            showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
            e.target.value = '';
            fileInfo.textContent = '';
        } else {
            fileInfo.textContent = `Fichier sélectionné: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        }
    }
}

function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    // Simuler l'envoi du message
    showNotification('Votre message a été envoyé! Nous vous répondrons dans les plus brefs délais.', 'success');
    e.target.reset();
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notification-message');
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'flex';
    
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    document.getElementById('notification').style.display = 'none';
}

// Fonctions globales accessibles depuis HTML
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
window.selectPaymentMethod = selectPaymentMethod;
window.exportOrders = exportOrders;
window.clearAllOrders = clearAllOrders;
window.hideNotification = hideNotification;
window.updateOrderStatus = updateOrderStatus;
window.deleteOrder = deleteOrder;
window.showOrderDetails = showOrderDetails;

// Créer un utilisateur admin par défaut au premier chargement
if (users.length === 0) {
    const adminUser = {
        id: 1,
        email: 'adminjwetlakay@gmail.com',
        name: 'Administrateur Jwèt Lakay',
        phone: '+50939442808',
        password: 'Admin123@',
        registrationDate: new Date().toLocaleDateString('fr-FR'),
        isAdmin: true
    };
    users.push(adminUser);
    localStorage.setItem('users', JSON.stringify(users));
}