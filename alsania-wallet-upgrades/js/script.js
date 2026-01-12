// script.js for Alsania Wallet (upgraded)

/*
 * This file coordinates page behaviour for the Alsania wallet. It manages
 * navigation between sections, wallet connection state, form submissions for
 * sending assets, bridging, editing domains and managing contacts. The
 * underlying blockchain interactions are stubbed out so you can plug in
 * web3.js or ethers.js calls as needed.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Grab elements once for reuse
    const sections = document.querySelectorAll('.wallet-section');
    const navLinks = document.querySelectorAll('.wallet-sidebar a');
    const ethBalanceSpan = document.getElementById('ethBalance');
    const alsBalanceSpan = document.getElementById('alsBalance');
    const txList = document.getElementById('txList');
    const receiveAddressDiv = document.getElementById('receiveAddress');
    const copyAddressBtn = document.getElementById('copyAddress');
    const domainListDiv = document.getElementById('domainList');
    const domainCustomDiv = document.getElementById('domainCustom');
    const domainNameInput = document.getElementById('domainName');
    const profileURIInput = document.getElementById('profileURI');
    const imageURIInput = document.getElementById('imageURI');
    const walletNftGrid = document.getElementById('walletNftGrid');
    const noNftsP = document.getElementById('noNfts');
    const historyBody = document.getElementById('historyBody');
    const disconnectBtn = document.getElementById('disconnectButton');
    const contactListUl = document.getElementById('contactList');

    // Maintain local arrays for history and contacts (could be persisted in localStorage)
    let historyData = [];
    let contacts = [];

    // Utility: show a specific section by id and hide others
    function showSection(id) {
        sections.forEach((sec) => {
            sec.style.display = sec.id === id ? 'block' : 'none';
        });
    }

    // Navigation handler – updates active class and displays section
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Send form submission
    const sendForm = document.getElementById('sendForm');
    sendForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const asset = document.getElementById('sendAsset').value;
        const to = document.getElementById('sendTo').value;
        const amount = document.getElementById('sendAmount').value;
        // Stub: integrate with web3 provider to send transaction
        alert(`Sending ${amount} ${asset.toUpperCase()} to ${to} (simulation).`);
        // Append to history
        const now = new Date().toISOString().split('T')[0];
        historyData.unshift({ date: now, type: 'Send', asset: asset.toUpperCase(), amount, status: 'Pending' });
        updateHistoryUI();
        updateRecentTx();
        sendForm.reset();
    });

    // Receive: copy address to clipboard
    copyAddressBtn.addEventListener('click', () => {
        const addr = receiveAddressDiv.textContent;
        if (!addr || addr.includes('Connect')) return;
        navigator.clipboard.writeText(addr).then(() => {
            copyAddressBtn.textContent = 'Copied!';
            setTimeout(() => (copyAddressBtn.textContent = 'Copy Address'), 1500);
        });
    });

    // Domain metadata form submission
    const domainForm = document.getElementById('domainForm');
    domainForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dName = domainNameInput.value;
        const profile = profileURIInput.value;
        const image = imageURIInput.value;
        alert(`Saving metadata for ${dName} (simulation).`);
        // Here you would call the contract to set profileURI and imageURI
        domainForm.reset();
        domainCustomDiv.style.display = 'none';
    });

    // Bridge form submission
    const bridgeForm = document.getElementById('bridgeForm');
    bridgeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const asset = document.getElementById('bridgeAsset').value;
        const chain = document.getElementById('bridgeChain').value;
        const amt = document.getElementById('bridgeAmount').value;
        alert(`Bridging ${amt} ${asset.toUpperCase()} to ${chain} (simulation).`);
        const now = new Date().toISOString().split('T')[0];
        historyData.unshift({ date: now, type: 'Bridge', asset: asset.toUpperCase(), amount: amt, status: 'Pending' });
        updateHistoryUI();
        updateRecentTx();
        bridgeForm.reset();
    });

    // Contacts: add new contact
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const address = document.getElementById('contactAddress').value.trim();
        contacts.push({ name, address });
        updateContactsUI();
        contactForm.reset();
    });

    // Disconnect wallet
    disconnectBtn.addEventListener('click', () => {
        localStorage.removeItem('aedConnectedAddress');
        location.reload();
    });

    // Update history table UI
    function updateHistoryUI() {
        historyBody.innerHTML = '';
        if (!historyData.length) {
            historyBody.innerHTML = '<tr><td colspan="5">No history yet.</td></tr>';
            return;
        }
        historyData.forEach((item) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.date}</td><td>${item.type}</td><td>${item.asset}</td><td>${item.amount}</td><td>${item.status}</td>`;
            historyBody.appendChild(row);
        });
    }

    // Update recent transactions list on dashboard
    function updateRecentTx() {
        txList.innerHTML = '';
        const recent = historyData.slice(0, 5);
        if (!recent.length) {
            txList.innerHTML = '<li>No transactions yet.</li>';
            return;
        }
        recent.forEach((tx) => {
            const li = document.createElement('li');
            li.textContent = `${tx.amount} ${tx.asset} • ${tx.type} on ${tx.date}`;
            txList.appendChild(li);
        });
    }

    // Render contacts list
    function updateContactsUI() {
        contactListUl.innerHTML = '';
        if (!contacts.length) {
            contactListUl.innerHTML = '<li>No contacts saved.</li>';
            return;
        }
        contacts.forEach((contact, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${contact.name}: ${contact.address}</span><button data-index="${index}">X</button>`;
            contactListUl.appendChild(li);
        });
    }

    // Delegate remove contact button clicks
    contactListUl.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const idx = parseInt(e.target.getAttribute('data-index'));
            contacts.splice(idx, 1);
            updateContactsUI();
        }
    });

    // Load wallet data when connected
    function loadWalletData() {
        const account = localStorage.getItem('aedConnectedAddress');
        if (!account) return;
        // Display connected address
        receiveAddressDiv.textContent = account;
        // Dummy balances for demo
        ethBalanceSpan.textContent = '1.23 ETH';
        alsBalanceSpan.textContent = '456.78 ALS';
        // Dummy domains list with click to edit
        const domains = ['sigma.alsania', 'vault.sigma.alsania'];
        domainListDiv.innerHTML = '';
        domains.forEach((d) => {
            const p = document.createElement('p');
            p.textContent = d;
            p.style.cursor = 'pointer';
            p.addEventListener('click', () => {
                // Populate edit form and show
                domainNameInput.value = d;
                profileURIInput.value = '';
                imageURIInput.value = '';
                domainCustomDiv.style.display = 'block';
            });
            domainListDiv.appendChild(p);
        });
        if (!domains.length) domainListDiv.textContent = 'No domains owned yet.';
        // Dummy NFTs
        const nfts = [
            // Example NFT data. Replace image paths with real IPFS URIs or your own artwork.
            { name: 'Genesis NFT', image: 'img/nft1.png' },
            { name: 'Vault Key', image: 'img/nft2.png' },
        ];
        walletNftGrid.innerHTML = '';
        nfts.forEach((nft) => {
            const card = document.createElement('div');
            card.className = 'nft-card';
            card.innerHTML = `<img src="${nft.image}" alt="${nft.name}" /><div class="nft-info"><h4>${nft.name}</h4></div>`;
            walletNftGrid.appendChild(card);
        });
        noNftsP.style.display = nfts.length ? 'none' : 'block';
        // Load contacts from localStorage if present
        const storedContacts = localStorage.getItem('alsWalletContacts');
        contacts = storedContacts ? JSON.parse(storedContacts) : [];
        updateContactsUI();
        // Load history from localStorage if present
        const storedHistory = localStorage.getItem('alsWalletHistory');
        historyData = storedHistory ? JSON.parse(storedHistory) : [];
        updateHistoryUI();
        updateRecentTx();
    }

    // Persist data before page unload
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('alsWalletContacts', JSON.stringify(contacts));
        localStorage.setItem('alsWalletHistory', JSON.stringify(historyData));
    });

    // Initialise UI
    loadWalletData();
});