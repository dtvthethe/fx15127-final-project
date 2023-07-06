import { app, h } from 'hyperapp';
import { Link } from '@hyperapp/router';

const Fragment = (props, children) => children;

const Profile = ({ profile, register, inputProfile }) => {
  const hasProfile = profile && profile.nSessions > 0;
  if (profile) {
    return hasProfile ? (
      <>
        <li class='nav-title'>{profile.fullname}</li>
        <li class='nav-item px-3 mb-2'>
          <div>
            <small class='text-muted'>
              <b>Email</b>
            </small>
          </div>
          <small>{profile.email}</small>
        </li>
        <li class='nav-item px-3 d-compact-none d-minimized-none mb-2'>
          <div>
            <small class='text-muted'>
              <b>Number of sessions</b>
            </small>
          </div>
          <small>{profile.nSessions} session(s)</small>
        </li>
        <li class='nav-item px-3 d-compact-none d-minimized-none mb-2'>
          <div>
            <small class='text-muted'>
              <b>Accuracy</b>
            </small>
          </div>
          <small>{profile.deviation / 100}%</small>
        </li>
      </>
    ) : (
      <>
        <li class='nav-title'>Register</li>
        <li class='nav-item px-3 mb-2'>
          <div>
            <small class='text-muted'>
              <b>Fullname</b>
            </small>
          </div>
          <input
            class='form-control form-control-sm'
            type='text'
            value={profile.fullname}
            oninput={e => {
              inputProfile({ field: 'fullname', value: e.target.value });
            }}
          ></input>
        </li>
        <li class='nav-item px-3 mb-2'>
          <div>
            <small class='text-muted'>
              <b>Email</b>
            </small>
          </div>
          <input
            class='form-control form-control-sm'
            type='email'
            value={profile.email}
            oninput={e => {
              inputProfile({ field: 'email', value: e.target.value });
            }}
          ></input>
        </li>
        <li class='nav-item px-3 mb-2'>
          <button
            class='btn  btn-sm btn-ghost-primary btn-block '
            type='button'
            onclick={() => register(true)}
          >
            Register
          </button>
        </li>
      </>
    );
  }
};

const Account = ({ account, balance, isAdmin }) => {
  return account ? (
    <div class='sidebar-header'>
      <img
        class='img-avatar img-thumbnail'
        src={'https://robohash.org/' + account}
      ></img>
      <div class='balance'>{balance / 1000000000000000000} ETH</div>
      {isAdmin ? (
        <h4>
          <span class='badge badge-pill badge-primary'>Administrator</span>
        </h4>
      ) : (
        <h4>
          <span class='badge badge-pill badge-secondary'>Member</span>
        </h4>
      )}
      <div class='account'>{account}</div>
    </div>
  ) : (
    <div></div>
  );
};

const Sidebar = ({
  account,
  balance,
  isAdmin,
  profile,
  register,
  inputProfile,
  location
}) => {
  const pathname = location.pathname;

  return (
    <div class='sidebar'>
      <Account
        account={account}
        balance={balance}
        isAdmin={isAdmin}
        profile={profile}
      ></Account>
      <nav class='sidebar-nav'>
        <ul class='nav'>
          <Profile
            profile={profile}
            register={register}
            inputProfile={inputProfile}
          ></Profile>
          <li class='nav-divider'></li>
          <li class='nav-title'>View all</li>
          <li class='nav-item'>
            <Link class={`nav-link ${pathname == '/' ? 'active' : ''}`} to='/'>
              <i class='fa-solid fa-house'></i> Home
            </Link>
          </li>
          <li class='nav-item'>
            <Link class={`nav-link ${pathname == '/products' ? 'active' : ''}`} to='/products'>
              <i class='fa-solid fa-scale-balanced'></i> Products
            </Link>
          </li>
          <li class='nav-item'>
            {
            isAdmin
              ? (<Link class={`nav-link ${pathname == '/participants' ? 'active' : ''}`} to='/participants'>
                <i class='fa-solid fa-users'></i> Participants
              </Link>)
              : <a class="nav-link cursor-no-drop" style="color: #747474"><i class='fa-solid fa-users'></i> Participants</a>
            }
          </li>
        </ul>
      </nav>
    </div>
  );
};

export { Sidebar };
