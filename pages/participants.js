import { app, h } from 'hyperapp';
import './participants.css';

const FrmParticipant = ({ inputNewParticipant, newParticipant, createNewParticipant }) => (
  <div class='p-2 flex product-detail'>
    <div class='card'>
      <div class='card-header'>
        <strong>Participant</strong>
      </div>
      <div class='card-body'>
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
                  inputNewParticipant({fieldName: 'address', value: e.target.value});
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
                  inputNewParticipant({fieldName: 'fullname', value: e.target.value});
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
                  inputNewParticipant({fieldName: 'email', value: e.target.value});
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div class='card-footer'>
        <button type='submit' class='btn btn-primary' onclick={createNewParticipant}>
          Create
        </button>
      </div>
    </div>
  </div>
);

const ParticipantRow = participant => (
  <tr class='participant'>
    <td scope='row' class='text-center'>
      <img
        class='img-avatar img-thumbnail'
        src={'https://robohash.org/' + participant.address}
      ></img>
    </td>
    <td scope='row' class='align-middle'>
      {participant.fullname}
    </td>
    <td scope='row' class='align-middle'>
      {participant.email}
    </td>
    <td scope='row' class='align-middle text-center'>
      {participant.nSessions}
    </td>
    <td scope='row' class='align-middle text-center'>
      {participant.deviation / 100} %
    </td>
    <td scope='row' class='align-middle text-center'>
      <code>{participant.address}</code>
    </td>
  </tr>
);

const Participants = ({ match }) => (
  { participants, newParticipant },
  { inputNewParticipant, createNewParticipant }
) => {
  return (
  <div class='d-flex w-100 h-100 bg-white'>
    <div class='products-list'>
      <table class='table table-hover table-striped'>
        <thead>
          <tr>
            <th scope='col' class='text-center'></th>
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
            return ParticipantRow(p);
          })}
        </tbody>
      </table>
    </div>
    {/* <div class='p-2 flex product-detail'></div> */}
    <FrmParticipant inputNewParticipant={inputNewParticipant} newParticipant={newParticipant} createNewParticipant={createNewParticipant} />
  </div>
)};

export { Participants };
