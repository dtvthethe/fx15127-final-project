import { app, h } from 'hyperapp';
import { Route, location } from '@hyperapp/router';
import { Products } from './pages/products';
import { Sidebar } from './pages/sidebar';
import { Participants } from './pages/participants';
import { config } from './config';
import { promisify } from 'util';
import './css/vendor/bootstrap.css';
import './css/vendor/coreui.css';
import './css/index.css';
import Main from './contracts/Main.json';
import Session from './contracts/Session.json';
import { InstallMetaMask } from './pages/installMetaMask';
import { Login } from './pages/login';
import JSAlert from 'js-alert';
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"
import { Home } from './pages/home';

const Fragment = (props, children) => children;

const Web3 = require('web3');
let web3js;

if (typeof web3 !== 'undefined') {
  web3js = new Web3(web3.currentProvider);
  const localKey = localStorage.getItem(config.loginStoreKey);

  if (localKey && localKey != undefined && localKey != 'undefined' && localKey != config.zeroAddress) {
    componentMain();
  } else {
    componentLogin();
  }

  window.ethereum.on('accountsChanged', async (error) => {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length === 0 || (accounts.length > 0 && accounts[0] === config.zeroAddress)) {
      localStorage.removeItem(config.loginStoreKey);
      window.location.replace('/');
    }

    if (accounts[0] !== localStorage.getItem(config.loginStoreKey)) {
      localStorage.setItem(config.loginStoreKey, accounts[0]);
      window.location.replace('/');
    }
  });
} else {
  // web3js = new Web3('ws://localhost:7545');
  componentInstalWallet();
}

function componentMain() {
  const mainContract = new web3js.eth.Contract(Main.abi, config.mainContract);

  var state = {
    count: 1,
    location: location.state,
    products: [],
    dapp: {},
    balance: 0,
    account: 0,
    admin: null,
    profile: null,
    fullname: '',
    email: ''.replace,
    newProduct: {},
    sessions: [],
    currentProductIndex: 0,
    frmParticipant: {
      txtAddress: true,
      txtFullname: true,
      txtEmail: true,
    },
    titlePage: '...',
    participants: [],
    isAdmin: false
  };

  // Functions of Main Contract
  const contractFunctions = {
    getAccounts: promisify(web3js.eth.getAccounts),
    getBalance: promisify(web3js.eth.getBalance),

    // TODO: The methods' name is for referenced. Update to match with your Main contract

    // Get Admin address of Main contract
    getAdmin: mainContract.methods.getAdmin().call,

    // Get participant by address
    participants: address => mainContract.methods.participants(address).call,

    // Get number of participants
    nParticipants: mainContract.methods.nParticipants().call,

    // Get address of participant by index (use to loop through the list of participants) 
    iParticipants: index => mainContract.methods.iParticipants(index).call,

    // Register new participant
    register: (account, fullname, email) =>
      mainContract.methods.register(account, fullname, email).send,

    // Get number of sessions  
    nSessions: mainContract.methods.nSessions().call,

    // Get address of session by index (use to loop through the list of sessions) 
    sessions: index => mainContract.methods.sessions(index).call,

    // Get admin profile
    getAdminProfile: () => mainContract.methods.getAdminProfile().call,

    // Update admin profile
    updateAdminProfile: (fullname, email) => mainContract.methods.updateAdminProfile(fullname, email).send,

    // Get all participants
    getAllParticipants: () => mainContract.methods.getAllParticipants().call,

    // Add participant
    addParticipant: (address) => mainContract.methods.addParticipant(address).send,

    // Creat new session
    createSession: (productName, description, images) => mainContract.methods.createSession(productName, description, images).send,

    // Get session address
    getAllSessionAddresses: () => mainContract.methods.getAllSessionAddresses().call,

    // Get session detail
    getSessionDetail: (address) => mainContract.methods.getSessionDetail(address).call,
  };

  const actions = {
    inputProfile: ({ field, value }) => state => {
      let profile = state.profile || {};
      profile[field] = value;
      return {
        ...state,
        profile
      };
    },

    inputNewProduct: ({ field, value }) => state => {
      let newProduct = state.newProduct || {};
      newProduct[field] = field === 'image' ? [value] : value;
      return {
        ...state,
        newProduct
      };
    },

    createProduct: () => async (state, actions) => {
      // let contract = new web3js.eth.Contract(Session.abi, {
      //   data: Session.bytecode
      // });
      // await contract
      //   .deploy({
      //     arguments: [
      //       // TODO: Argurment when Deploy the Session Contract
      //       // It must be matched with Session.sol Contract Constructor
      //       // Hint: You can get data from `state`
      //     ]
      //   })
      //   .send({ from: state.account });

      // actions.getSessions();
      await contractFunctions.createSession(state.newProduct.name, state.newProduct.description, state.newProduct.image)({ from: state.account });
      state.newProduct = {};
      await actions.fetchBalance();
      await actions.getSessions();
    },

    selectProduct: i => state => {
      return {
        currentProductIndex: i
      };
    },

    sessionFn: (action) => async (state, actions) => {
      const session = state.sessions[action.payload.index];

      if (session == undefined || session == null || session.length == 0) {
        return;
      }

      const contract = session.contract;

      switch (action.type) {
        case 'start':
          //TODO: Handle event when User Start a new session
          await contract.methods.startSession().send({ from: state.account });
          await actions.fetchBalance();

          break;
        case 'stop':
          //TODO: Handle event when User Stop a session
          await contract.methods.stopSession(action.payload.price).send({ from: state.account });
          await actions.fetchBalance();
          await actions.getParticipants();

          break;
        case 'pricing':
          //TODO: Handle event when User Pricing a product
          //The inputed Price is stored in `data`
          await contract.methods.pricing(action.payload.price).send({ from: state.account });
          await actions.fetchBalance();

        //   break;
        // case 'close':
        //   //TODO: Handle event when User Close a session
        //   //The inputed Price is stored in `data`
      }

      await actions.getSessions();
    },

    location: location.actions,

    getAccount: () => async (state, actions) => {
      // let accounts = await contractFunctions.getAccounts();
      // let balance = await contractFunctions.getBalance(accounts[0]);
      // const admin = await contractFunctions.getAdmin();
      // let profile = await contractFunctions.participants(accounts[0])();

      // actions.setAccount({
      //   account: accounts[0],
      //   balance,
      //   isAdmin: admin === accounts[0],
      //   profile
      // });
      const currentAccount = localStorage.getItem(config.loginStoreKey);
      const admin = await contractFunctions.getAdmin();

      try {
        let profile = currentAccount == admin.toLowerCase()
          ? await contractFunctions.getAdminProfile()({ from: currentAccount })
          : await contractFunctions.participants(currentAccount)({ from: currentAccount });

        if (profile != undefined && profile.account !== config.zeroAddress) {
          const balance = await contractFunctions.getBalance(currentAccount);
          profile = {
            account: currentAccount,
            deviation: profile.deviation || 0,
            email: profile.email || '',
            fullname: profile.fullName || '',
            numberOfSession: profile.numberOfSession || 0
          };
          actions.setAccount({
            account: currentAccount,
            balance,
            isAdmin: currentAccount == admin.toLowerCase(),
            profile
          });
        } else {
          localStorage.removeItem(config.loginStoreKey);
          JSAlert.alert('This account is not exist in Participant List. Please switch to Admin account to add this!', null, JSAlert.Icons.Failed).then(() => {
            window.location.replace('/');
          });
        }
      } catch (error) {
        console.log(error);
      }
    },
    setAccount: ({ account, balance, isAdmin, profile }) => state => {
      return {
        ...state,
        account: account,
        balance: balance,
        isAdmin: isAdmin,
        profile
      };
    },

    getParticipants: () => async (state, actions) => {
      let participants = [];

      // TODO: Load all participants from Main contract.
      // One participant should contain { address, fullname, email, nSession and deviation }
      if (!state.isAdmin) {
        actions.setParticipants(participants);

        return;
      }

      try {
        const results = await contractFunctions.getAllParticipants()({ from: state.account });
        participants = results.map(item => {
          return {
            address: item.account,
            deviation: item.deviation || 0,
            email: item.email || '',
            fullname: item.fullName || '',
            nSessions: item.numberOfSession || 0
          }
        });
      } catch (error) {
        console.log(error);
      }

      actions.setParticipants(participants);
    },

    setParticipants: participants => state => {
      return {
        ...state,
        participants: participants
      };
    },

    setProfile: profile => state => {
      return {
        ...state,
        profile: profile
      };
    },

    register: (payload) => async (state, actions) => {
      // TODO: Register new participant
      const loading = JSAlert.loader('Please wait...');
      const currentAccount = localStorage.getItem(config.loginStoreKey);

      try {
        if (state.isAdmin) {
          if (payload.isUpdateProfile) {
            // Admin update profile
            await contractFunctions.updateAdminProfile(
              payload.fullname,
              payload.email
            )({ from: currentAccount });
          } else {
            // Admin edit Participant profile
            await contractFunctions.register(
              payload.address,
              payload.fullname,
              payload.email
            )({ from: currentAccount });
            await actions.fetchBalance();
            await actions.getParticipants();
          }
        } else {
          // Participant update profile
          if (payload.isUpdateProfile) {
            await contractFunctions.register(
              payload.address,
              payload.fullname,
              payload.email
            )({ from: currentAccount });
          }
        }

        Toastify({
          text: 'Profile saved, Fetching balance...',
          position: 'center',
          backgroundColor: config.color.success
        }).showToast();
      } catch (error) {
        Toastify({
          text: 'Error profile update',
          position: 'center',
          backgroundColor: config.color.error
        }).showToast();
        console.log(error);
      }

      if (payload.isUpdateProfile) {
        const profile = state.isAdmin
          ? await contractFunctions.getAdminProfile()({ from: currentAccount })
          : await contractFunctions.participants(currentAccount)({ from: currentAccount });
        await actions.fetchBalance();

        actions.setProfile({
          ...state.profile,
          email: profile.email || '',
          fullname: profile.fullName || ''
        });
      }

      loading.dismiss();
    },

    getSessions: () => async (state, actions) => {
      // TODO: Get the number of Sessions stored in Main contract
      // let nSession = await contractFunctions.nSessions();
      // let sessions = [];

      // TODO: And loop through all sessions to get information
      const results = await contractFunctions.getAllSessionAddresses()({ from: state.account });
      const nSession = results.length;
      let sessions = [];

      for (let index = 0; index < nSession; index++) {
        // Get session address
        let session = results[index];
        // Load the session contract on network
        let contract = new web3js.eth.Contract(Session.abi, session);

        let id = session;

        // TODO: Load information of session.
        // Hint: - Call methods of Session contract to reveal all nessesary information
        //       - Use `await` to wait the response of contract
        const sessionDetail = await contract.methods.getSessionDetail().call({ from: state.account });

        let name = sessionDetail[0] || ''; // TODO
        let description = sessionDetail[1] || ''; // TODO
        let price = sessionDetail[3] || 0; // TODO
        let image = sessionDetail[2].length > 0 ? sessionDetail[2][0] : ''; // TODO
        let status = sessionDetail[5] || '-'; // TODO
        let finalPrice = sessionDetail[4] || 0; // TODO
        let priceFormat = 0;
        let finalPriceFormat = 0;
        let myPricingFormat = '∞';
        let myPricingOriginal = 0;
        let prices = [];

        if (state.isAdmin) {
          let arrPrices = await contract.methods.getAllPrices().call({ from: state.account });

          if (arrPrices.length > 0) {
            prices.push('$ ' + Math.min(...arrPrices).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
            prices.push('$ ' + Math.max(...arrPrices).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
          }
        } else {
          const myPricing = await contract.methods.getPricingByParticipant().call({ from: state.account });
          myPricingFormat = '$ ' + myPricing.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          myPricingOriginal = myPricing;
        }

        if (price > 0) {
          priceFormat = price.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        if (finalPrice > 0) {
          finalPriceFormat = finalPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        sessions.push({
          id,
          name,
          description,
          price,
          finalPrice,
          contract,
          image,
          status,
          priceFormat,
          finalPriceFormat,
          myPricingFormat,
          myPricingOriginal,
          prices
        });
      }

      actions.setSessions(sessions);
    },

    setSessions: sessions => state => {
      return {
        ...state,
        sessions: sessions
      };
    },

    checkWalletInstalled: () => state => {
      if (typeof web3js !== 'undefined') {
        return {
          ...state,
          walletInstalled: true
        };
      } else {
        return {
          ...state,
          walletInstalled: false
        };
      }
    },

    setFrmParticipant: ({ fieldName, value }) => state => {
      let frmParticipant = state.frmParticipant;
      frmParticipant[fieldName] = !value;

      return {
        ...state,
        frmParticipant
      };
    },

    createNewParticipant: (address) => async (state, actions) => {
      const loading = JSAlert.loader('Please wait...');

      try {
        await contractFunctions.addParticipant(address)({ from: state.account });
        await actions.fetchBalance();
        await actions.getParticipants();
        loading.dismiss();
        Toastify({
          text: 'Participant saved!',
          position: 'center',
          backgroundColor: config.color.success
        }).showToast();
      } catch (error) {
        console.log(error);
        loading.dismiss();
        Toastify({
          text: 'Error on handle save participant!',
          position: 'center',
          backgroundColor: config.color.error
        }).showToast();
      }
    },

    checkPermission: () => (state, actions) => {
      if (state.isAdmin === false && config.onlyAdminPages.includes(state.location.pathname)) {
        JSAlert.alert('Only admin can access this page!', null, JSAlert.Icons.Failed).then(() => {
          window.location.replace('/');
        });
      }
    },

    fetchBalance: () => async (state, actions) => {
      let balance = await contractFunctions.getBalance(state.account);
      state.balance = balance;
    },

    fetchData: () => async (state, actions) => {
      await actions.getAccount();
      await actions.checkPermission();
      await actions.getParticipants();
      await actions.getSessions();
    },
  };

  const view = (
    state,
    { fetchData, register, inputProfile }
  ) => {
    return (
      <body
        class='app sidebar-show sidebar-fixed'
        oncreate={() => {
          fetchData();
        }}
      >
        <div class='app-body'>
          <Sidebar
            balance={state.balance}
            account={state.account}
            isAdmin={state.isAdmin}
            profile={state.profile}
            register={register}
            inputProfile={inputProfile}
            location={state.location}
          ></Sidebar>
          <main class='main d-flex p-3'>
            <div class='h-100  w-100'>
              <Route path='/products' render={Products}></Route>
              <Route path='/participants' render={Participants}></Route>
              <Route path='/' render={Home}></Route>
            </div>
          </main>
        </div>
      </body>
    );
  };

  document.title = `Home | ${config.APP_NAME}` || 'N/A';
  const el = document.body;
  const main = app(state, actions, view, el);
  const unsubscribe = location.subscribe(main.location);
}

function componentInstalWallet() {
  const state = {};
  const actions = {};
  const view = (state, actions) => (
    <body>
      <InstallMetaMask />
    </body>
  );

  document.title = `Install MetaMask | ${config.APP_NAME}` || 'N/A';
  app(state, actions, view, document.body)
};

function componentLogin() {
  const state = {};
  const actions = {};
  const view = (state, actions) => (
    <body>
      <Login />
    </body>
  );

  document.title = `Sign-in | ${config.APP_NAME}` || 'N/A';
  app(state, actions, view, document.body)
};
