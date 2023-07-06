import { app, h } from 'hyperapp';
import './participants.css';
import JSAlert from 'js-alert';
import Toastify from 'toastify-js';
import { modalHide, modalShow } from './common/modal.js';
import { config } from '../config';

const MyModal = ({ inputNewParticipant, newParticipant, handleOnCreateParticipant, frmParticipant }) => (
  <div id="userModal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Participant</h4>
        </div>
        <div class="modal-body">
          <div class='row'>
            <div class='col-sm-12'>
              <div class='form-group'>
                <label for='address'>Address</label>
                <input
                  type='text'
                  class='form-control'
                  id='address'
                  placeholder='0x94645E...'
                  value={newParticipant.address}
                  disabled={frmParticipant.txtAddress}
                  maxlength="50"
                  oninput={e => {
                    inputNewParticipant({ fieldName: 'address', value: e.target.value });
                  }}
                />
              </div>
              <div class='form-group'>
                <label for='fullname'>Fullname <span class="text-info">(Only enable when admin edit participant or user first login)</span></label>
                <input
                  type='text'
                  class='form-control'
                  id='fullname'
                  placeholder='John Doe'
                  value={newParticipant.fullname}
                  disabled={frmParticipant.txtFullname}
                  maxlength="120"
                  oninput={e => {
                    inputNewParticipant({ fieldName: 'fullname', value: e.target.value });
                  }}
                />
              </div>
              <div class='form-group'>
                <label for='address'>Email <span class="text-info">(Only enable when admin edit participant or user first login)</span></label>
                <input
                  type='text'
                  class='form-control'
                  id='email'
                  placeholder='example@email.com'
                  value={newParticipant.email}
                  disabled={frmParticipant.txtEmail}
                  maxlength="120"
                  oninput={e => {
                    inputNewParticipant({ fieldName: 'email', value: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => modalHide('userModal')}>Close</button>
          <button type="button" class="btn btn-success" onclick={() => handleOnCreateParticipant()}>Save</button>
        </div>
      </div>
    </div>
  </div>
);

const ParticipantRow = ({ participant, openUserEditModal }) => (
  <tr class='participant'>
    <td scope='row' class='text-center'>
      <img
        class='img-avatar img-thumbnail'
        src={'https://robohash.org/' + participant.address}
      ></img>
    </td>
    <td scope='row' class='align-middle'>
      {participant.fullname || 'N/A'}
    </td>
    <td scope='row' class='align-middle'>
      {participant.email || 'N/A'}
    </td>
    <td scope='row' class='align-middle text-center'>
      {participant.nSessions || 0}
    </td>
    <td scope='row' class='align-middle text-center'>
      {participant.deviation}%
    </td>
    <td scope='row' class='align-middle text-center'>
      <code>{participant.address}</code>
    </td>
    <td>
      <button type="button" class="btn btn-warning" onclick={() => openUserEditModal(participant.address)}>
        <i class="fa-regular fa-pen-to-square"></i> Edit
      </button>
    </td>
  </tr>
);

const Participants = ({ match }) => (
  { participants, newParticipant, frmParticipant },
  { inputNewParticipant, createNewParticipant, setFrmParticipant, register }
) => {
  document.title = `Participants | ${config.APP_NAME}` || 'N/A';

  const openUserModal = () => {
    frmAdd(true, false);
    modalShow('userModal');
    resetForm();
  }

  const openUserEditModal = (address) => {
    const results = participants.filter((item) => {
      return item.address === address;
    });

    if (results.length == 0) {
      Toastify({
        text: 'Participant not found!',
        position: 'center',
        backgroundColor: config.color.success
      }).showToast();
      return;
    }

    const part = results[0];
    frmAdd(false, true);
    modalShow('userModal');
    resetForm(address, part.fullname, part.email);
  }

  const handleOnCreateParticipant = async () => {
    modalHide('userModal');

    try {
      if (frmParticipant.txtAddress === true) {
        await register(false);
      } else {
        await createNewParticipant();
      }
    } catch (error) {
    }
  }

  const resetForm = (address = '', fullname = '', email = '') => {
    inputNewParticipant({ fieldName: 'address', value: address });
    inputNewParticipant({ fieldName: 'fullname', value: fullname });
    inputNewParticipant({ fieldName: 'email', value: email });
  }

  const frmAdd = (txtAddress, txtOther) => {
    setFrmParticipant({ fieldName: 'txtAddress', value: txtAddress });
    setFrmParticipant({ fieldName: 'txtFullname', value: txtOther });
    setFrmParticipant({ fieldName: 'txtEmail', value: txtOther });
  }

  return (
    <div class='d-flex w-100 h-100 bg-white'>
      <div class='products-list'>
        <table class='table table-hover table-striped'>
          <thead>
            <tr>
              <th scope='col' class='text-center'>
                <button type="button" class="btn btn-success" onclick={() => openUserModal()} disabled={participants == undefined || participants.length >= config.MAX_OF_PARTICIPANTS ? 'disabled' : ''}>
                  <i class="fa-solid fa-plus"></i> Add
                </button>
              </th>
              <th scope='col'>Fullname</th>
              <th scope='col'>Email</th>
              <th scope='col' class='text-center'>
                Number of sessions
              </th>
              <th scope='col' class='text-center'>
                Deviation
              </th>
              <th scope='col' class='text-center'>
                Address
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(participants || []).map((p, i) => {
              p.no = i + 1;
              return ParticipantRow({ participant: p, openUserEditModal });
            })}
          </tbody>
        </table>
      </div>
      {/* <div class='p-2 flex product-detail'></div> */}
      <MyModal
        inputNewParticipant={inputNewParticipant}
        newParticipant={newParticipant}
        handleOnCreateParticipant={handleOnCreateParticipant}
        frmParticipant={frmParticipant}
      />
    </div>
  )
};

export { Participants };
