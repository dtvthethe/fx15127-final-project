import { app, h } from 'hyperapp';
import './participants.css';
import ModalVanilla from 'modal-vanilla';

const MyModal = ({ closeModal, inputNewParticipant, newParticipant, handleOnCreateParticipant }) => (
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
                  required
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
                  oninput={e => {
                    inputNewParticipant({ fieldName: 'email', value: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
          <button type="button" class="btn btn-secondary" onclick={closeModal}>Close</button>
          <button type="button" class="btn btn-success" onclick={() => handleOnCreateParticipant()}>Save</button>
        </div>
      </div>
    </div>
  </div>
);

const ParticipantRow = ({ participant, openModal }) => (
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
      {participant.deviation / 100} %
    </td>
    <td scope='row' class='align-middle text-center'>
      <code>{participant.address}</code>
    </td>
    <td>
      <button type="button" class="btn btn-warning" onclick={openModal}>
        <i class="fa-regular fa-pen-to-square"></i> Edit
      </button>
    </td>
  </tr>
);

const Participants = ({ match }) => (
  { participants, newParticipant, frmParticipantShow },
  { inputNewParticipant, createNewParticipant }
) => {
  const myModal = new ModalVanilla({
    el: document.getElementById('userModal')
  });

  const openModal = () => {
    myModal.show();
  };

  const closeModal = () => {
    myModal.hide();
  };

  const handleOnCreateParticipant = async () => {
    await createNewParticipant();
    document.getElementsByClassName('modal-backdrop')[0].classList.add('show');
    closeModal();
  }

  return (
    <div class='d-flex w-100 h-100 bg-white'>
      <div class='products-list'>
        <table class='table table-hover table-striped'>
          <thead>
            <tr>
              <th scope='col' class='text-center'>
                <button type="button" class="btn btn-success" onclick={openModal}>
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
            </tr>
          </thead>
          <tbody>
            {(participants || []).map((p, i) => {
              p.no = i + 1;
              return ParticipantRow({ participant: p, openModal });
            })}
          </tbody>
        </table>
      </div>
      {/* <div class='p-2 flex product-detail'></div> */}
      <MyModal closeModal={closeModal} inputNewParticipant={inputNewParticipant} newParticipant={newParticipant} handleOnCreateParticipant={handleOnCreateParticipant} />
    </div>
  )
};

export { Participants };
