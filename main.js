// Variables globales
let currentUser = null;
let cart = [];
let orders = [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let adminCredentials = {
    email: 'handylopez1996@gmail.com',
    password: 'Handy123'
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showPage('accueil');
        updateNavigation();
        loadCart();
    } else {
        showPage('connexion');
    }

    // Gestionnaire pour le menu hamburger
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        document.querySelector('nav ul').classList.toggle('show');
    });

    // Gestionnaires pour les liens de navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.id === 'logout-btn') {
                logout();
            } else {
                const page = this.getAttribute('data-page');
                showPage(page);
            }
            // Fermer le menu mobile après clic
            document.querySelector('nav ul').classList.remove('show');
        });
    });

    // Gestionnaires pour les formulaires d'authentification
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('inscription');
    });

    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('connexion');
    });

    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });

    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    });

    // Gestionnaire pour les boutons "Ajouter au panier"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = productCard.getAttribute('data-product');
            const price = parseInt(productCard.getAttribute('data-price'));
            const title = productCard.querySelector('.product-title').textContent;
            
            addToCart(product, title, price);
        });
    });

    // Gestionnaires pour les méthodes de paiement
    document.getElementById('moncash-method').addEventListener('click', function() {
        selectPaymentMethod('moncash');
    });

    document.getElementById('natcash-method').addEventListener('click', function() {
        selectPaymentMethod('natcash');
    });

    // Gestionnaires pour les formulaires de paiement
    document.getElementById('moncash-payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processPayment('moncash');
    });

    document.getElementById('natcash-payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        processPayment('natcash');
    });
});

// Fonctions de navigation
function showPage(pageId) {
    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Afficher la page demandée
    document.getElementById(pageId).classList.add('active');
    
    // Mettre à jour la navigation si nécessaire
    if (pageId === 'panier') {
        updateCartDisplay();
    } else if (pageId === 'profil') {
        updateProfileDisplay();
    } else if (pageId === 'admin') {
        updateAdminDisplay();
    }
}

function updateNavigation() {
    // Afficher/masquer le lien admin selon l'utilisateur
    const adminLink = document.querySelector('.admin-link');
    if (currentUser && currentUser.email === adminCredentials.email) {
        adminLink.style.display = 'block';
    } else {
        adminLink.style.display = 'none';
    }
}

// Fonctions d'authentification
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Vérification des identifiants admin
    if (email === adminCredentials.email && password === adminCredentials.password) {
        currentUser = {
            email: email,
            name: 'Administrateur',
            phone: '',
            registrationDate: new Date().toLocaleDateString()
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showPage('accueil');
        updateNavigation();
        alert('Connexion réussie en tant qu\'administrateur!');
        return;
    }
    
    // Vérification des utilisateurs normaux
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showPage('accueil');
        updateNavigation();
        loadCart();
        alert('Connexion réussie!');
    } else {
        alert('Email ou mot de passe incorrect.');
    }
}

function register() {
    const email = document.getElementById('register-email').value;
    const name = document.getElementById('register-name').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (password !== confirm) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }
    
    // Vérifier si l'utilisateur existe déjà
    if (users.find(u => u.email === email)) {
        alert('Un compte avec cet email existe déjà.');
        return;
    }
    
    // Créer un nouvel utilisateur
    const newUser = {
        email: email,
        name: name,
        phone: phone,
        password: password,
        registrationDate: new Date().toLocaleDateString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showPage('accueil');
    updateNavigation();
    alert('Inscription réussie! Bienvenue sur Jwèt Lakay.');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    cart = [];
    if (currentUser) {
        localStorage.removeItem('cart_' + currentUser.email);
    }
    showPage('connexion');
    alert('Vous avez été déconnecté.');
}

// Fonctions du panier
function addToCart(product, title, price) {
    if (!currentUser) {
        alert('Veuillez vous connecter pour ajouter des articles au panier.');
        showPage('connexion');
        return;
    }
    
    const existingItem = cart.find(item => item.product === product);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            product: product,
            title: title,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    alert('Produit ajouté au panier!');
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center;">Votre panier est vide.</p>';
        cartTotalElement.textContent = 'Total: 0 HTG';
        return;
    }
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.title}</h3>
                <p class="cart-item-price">${item.price} HTG x ${item.quantity}</p>
            </div>
            <div>
                <button class="remove-from-cart" data-index="${index}">❌</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    cartTotalElement.textContent = `Total: ${total} HTG`;
    
    // Mettre à jour les montants dans les formulaires de paiement
    document.getElementById('moncash-amount').value = total;
    document.getElementById('natcash-amount').value = total;
    
    // Ajouter les gestionnaires d'événements pour les boutons de suppression
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeFromCart(index);
        });
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
}

function saveCart() {
    if (currentUser) {
        localStorage.setItem('cart_' + currentUser.email, JSON.stringify(cart));
    }
}

function loadCart() {
    if (currentUser) {
        const savedCart = localStorage.getItem('cart_' + currentUser.email);
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }
}

// Fonctions de paiement
function selectPaymentMethod(method) {
    // Réinitialiser la sélection
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('active');
    });
    
    // Masquer tous les formulaires
    document.getElementById('moncash-form').style.display = 'none';
    document.getElementById('natcash-form').style.display = 'none';
    
    // Activer la méthode sélectionnée
    if (method === 'moncash') {
        document.getElementById('moncash-method').classList.add('active');
        document.getElementById('moncash-form').style.display = 'block';
    } else if (method === 'natcash') {
        document.getElementById('natcash-method').classList.add('active');
        document.getElementById('natcash-form').style.display = 'block';
    }
}

function processPayment(method) {
    if (cart.length === 0) {
        alert('Votre panier est vide.');
        return;
    }
    
    let orderData = {
        id: Date.now(),
        user: currentUser.email,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        method: method,
        date: new Date().toLocaleString(),
        status: 'En attente'
    };
    
    // Récupérer les données du formulaire
    if (method === 'moncash') {
        orderData.payerName = document.getElementById('moncash-name').value;
        orderData.payerNumber = document.getElementById('moncash-number').value;
        orderData.freefireId = document.getElementById('freefire-id').value;
    } else if (method === 'natcash') {
        orderData.payerName = document.getElementById('natcash-name').value;
        orderData.payerNumber = document.getElementById('natcash-number').value;
        orderData.freefireId = document.getElementById('freefire-id-natcash').value;
    }
    
    // Sauvegarder la commande
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Vider le panier
    cart = [];
    saveCart();
    
    alert('Votre commande a été passée avec succès! Nous traiterons votre paiement rapidement.');
    showPage('accueil');
}

// Fonctions d'affichage des pages
function updateProfileDisplay() {
    if (currentUser) {
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('profile-phone').textContent = currentUser.phone;
        document.getElementById('profile-date').textContent = currentUser.registrationDate;
        
        // Afficher l'historique des commandes
        const orderHistory = document.getElementById('order-history');
        const userOrders = (JSON.parse(localStorage.getItem('orders')) || [])
            .filter(order => order.user === currentUser.email);
        
        if (userOrders.length === 0) {
            orderHistory.innerHTML = '<p style="text-align: center; margin-top: 20px;">Aucune commande passée pour le moment.</p>';
        } else {
            let html = '';
            userOrders.forEach(order => {
                html += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h3>Commande #${order.id}</h3>
                            <p>Date: ${order.date}</p>
                            <p>Total: ${order.total} HTG</p>
                            <p>Statut: ${order.status}</p>
                        </div>
                    </div>
                `;
            });
            orderHistory.innerHTML = html;
        }
    }
}

function updateAdminDisplay() {
    if (currentUser && currentUser.email === adminCredentials.email) {
        const ordersTableBody = document.getElementById('orders-table-body');
        orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        let html = '';
        orders.forEach(order => {
            const itemsText = order.items.map(item => `${item.title} (x${item.quantity})`).join(', ');
            
            html += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.user}</td>
                    <td>${itemsText}</td>
                    <td>${order.total} HTG</td>
                    <td>${order.method}</td>
                    <td>${order.status}</td>
                </tr>
            `;
        });
        
        ordersTableBody.innerHTML = html;
    } else {
        alert('Accès non autorisé.');
        showPage('accueil');
    }
}