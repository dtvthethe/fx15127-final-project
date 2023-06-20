import { app, h } from 'hyperapp';
import { Link, Route, location } from '@hyperapp/router';
import { Products } from './pages/products';
import { Sidebar } from './pages/sidebar';
import { Participants } from './pages/participants';
import { config } from './config';
import { promisify } from 'util';
import './css/vendor/bootstrap.css';
import './css/vendor/coreui.css';
import './css/index.css';
import './css/style.css';
import Main from './contracts/Main.json';
import Session from './contracts/Session.json';
import { InstallMetaMask } from './pages/installMetaMask';
import { Login } from './pages/login';

const Fragment = (props, children) => children;

const Web3 = require('web3');
let web3js;

if (typeof web3 !== 'undefined') {
  web3js = new Web3(web3.currentProvider);

  if (localStorage.getItem(config.loginStoreKey)) {
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
    newParticipant: {
      address: '',
      fullname: '',
      email: ''
    },
    frmParticipant: {
      txtAddress: true,
      txtFullname: true,
      txtEmail: true,
    }
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
      newProduct[field] = value;
      return {
        ...state,
        newProduct
      };
    },

    createProduct: () => async (state, actions) => {
      let contract = new web3js.eth.Contract(Session.abi, {
        data: Session.bytecode
      });
      await contract
        .deploy({
          arguments: [
            // TODO: Argurment when Deploy the Session Contract
            // It must be matched with Session.sol Contract Constructor
            // Hint: You can get data from `state`
          ]
        })
        .send({ from: state.account });

      actions.getSessions();
    },

    selectProduct: i => state => {
      return {
        currentProductIndex: i
      };
    },

    sessionFn: (action, data) => (state, { }) => {
      switch (action) {
        case 'start':
          //TODO: Handle event when User Start a new session
          break;
        case 'stop':
          //TODO: Handle event when User Stop a session

          break;
        case 'pricing':
          //TODO: Handle event when User Pricing a product
          //The inputed Price is stored in `data`

          break;
        case 'close':
          //TODO: Handle event when User Close a session
          //The inputed Price is stored in `data`

          break;
      }
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
          window.location.replace('/');
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
      try {
        const results = await contractFunctions.getAllParticipants()({ from: state.account });
        participants = results.map(item => {
          return {
            address: item.account,
            deviation: item.deviation || 0,
            email: item.email || '',
            fullname: item.fullName || '',
            nSession: item.numberOfSession || 0,
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

    register: (isUpdateProfile) => async (state, actions) => {
      // TODO: Register new participant
      const currentAccount = localStorage.getItem(config.loginStoreKey);

      try {
        if (state.isAdmin) {
          if (isUpdateProfile) {
            await contractFunctions.updateAdminProfile(
              state.profile.fullname,
              state.profile.email
            )({ from: currentAccount });
          } else {
            await contractFunctions.register(
              state.newParticipant.address,
              state.newParticipant.fullname,
              state.newParticipant.email
            )({ from: currentAccount });
            await actions.getParticipants();
          }
          
        } else {
          // await contractFunctions.register(
          //   state.profile.fullname,
          //   state.profile.email
          // ).send({ from: currentAccount });
          alert('You are not admin');
        }
      } catch (error) {
        console.log(error);
      }

      // const profile = {};
      // TODO: And get back the information of created participant
      if (isUpdateProfile) {
        const profile = state.isAdmin
          ? await contractFunctions.getAdminProfile()({ from: currentAccount })
          : await contractFunctions.participants(currentAccount)({ from: currentAccount });

        actions.setProfile({
          ...state.profile,
          email: profile.email || '',
          fullname: profile.fullName || ''
        });
      }
    },

    getSessions: () => async (state, actions) => {
      // TODO: Get the number of Sessions stored in Main contract
      let nSession = await contractFunctions.nSessions();
      let sessions = [];

      // TODO: And loop through all sessions to get information

      for (let index = 0; index < nSession; index++) {
        // Get session address
        let session = await contractFunctions.sessions(index)();
        // Load the session contract on network
        let contract = new web3js.eth.Contract(Session.abi, session);

        let id = session;

        // TODO: Load information of session.
        // Hint: - Call methods of Session contract to reveal all nessesary information
        //       - Use `await` to wait the response of contract

        let name = ''; // TODO
        let description = ''; // TODO
        let price = 0; // TODO
        let image = ''; // TODO

        sessions.push({ id, name, description, price, contract, image });
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

    inputNewParticipant: ({ fieldName, value }) => state => {
      let newParticipant = state.newParticipant;
      newParticipant[fieldName] = value;

      return {
        ...state,
        newParticipant
      };
    },

    setFrmParticipant: ({ fieldName, value }) => state => {
      let frmParticipant = state.frmParticipant;
      frmParticipant[fieldName] = !value;

      return {
        ...state,
        frmParticipant
      };
    },

    createNewParticipant: () => async (state, actions) => {
      try {
        await contractFunctions.addParticipant(state.newParticipant.address)({ from: state.account });
        await actions.getParticipants();
      } catch (error) {
        console.log(error);
      }
    },

    fetchData: () => async (state, actions) => {
      await actions.getAccount();
      await actions.getParticipants();
      await actions.getSessions();
    }
  };

  const view = (
    state,
    { fetchData, register, inputProfile }
  ) => {
    // return (<body>Test</body>);
    // console.log(
    //   state
    // );
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
          ></Sidebar>
          <main class='main d-flex p-3'>
            <div class='h-100  w-100'>
              <Route path='/products' render={Products}></Route>
              <Route path='/participants' render={Participants}></Route>
            </div>
          </main>
        </div>
      </body>
    );
  };

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
  app(state, actions, view, document.body)
};
