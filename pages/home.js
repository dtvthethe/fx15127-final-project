import { h, app } from "hyperapp";
import './home.css';
import Chart from 'chart.js/auto';
import { config } from '../config';

let sessionChart = null;
let topParticipants = null;

const Home = () => ({ sessions, participants, isAdmin }, { }) => {
  const handleOnUpdate = () => {
    handleHomeLoadData();
  }

  const handleHomeLoadData = () => {
    if (sessions.length > 0) {
      createSessionChart();

      const leftPanel = document.getElementById("custom-scrollbar");
      const rightPanel = document.getElementById("sessionChart");
      const rightPanelHeight = rightPanel.clientHeight;
      leftPanel.style.height = rightPanelHeight + 'px';
      document.getElementById('sessionAlert').style.display = 'none';
      document.getElementById('sessionChart').style.opacity = '1';
    } else {
      document.getElementById('sessionAlert').style.display = 'block';
      document.getElementById('sessionChart').style.opacity = '0';
    }

    if (participants.length > 0) {
      topParticipants = participants.sort((current, next) => {
        const dCurrent = Number(current.deviation) || 0;
        const dNext = Number(next.deviation) || 0;
        if (dCurrent == dNext) {
          return 0;
        }
        else {
          return (dCurrent < dNext) ? -1 : 1;
        }
      });
    }
  }

  const createSessionChart = () => {
    const names = sessions.map(p => p.name || p.id.substring(0, 3) + '...' + p.id.substring(38, 42));
    const suggestPrices = sessions.map(p => p.price || 0);
    const finalPrices = sessions.map(p => p.finalPrice || 0);

    if (sessionChart != null) {
      sessionChart.destroy();
    }

    const ctx = document.getElementById('sessionChart').getContext('2d');
    sessionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [
          {
            label: 'Suggest Price',
            data: suggestPrices,
            fill: false,
            backgroundColor: '#f96384',
            tension: 0.1,
          },
          {
            label: 'Final Price',
            data: finalPrices,
            fill: false,
            backgroundColor: '#4bc0c0',
            tension: 0.1,
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        barPercentage: 0.9, // Tỷ lệ rộng cột
        categoryPercentage: 0.3, // Tỷ lệ rộng nhóm cột
      }
    });
  };

  const handleOnCreate = () => {
    handleHomeLoadData();
  }

  return (
    <div>
      <div class='d-flex w-100 bg-white home-title'>
        <h3>{config.APP_NAME}</h3>
      </div>
      <div class='d-flex w-100 h-100' onupdate={handleOnUpdate} oncreate={handleOnCreate}>
        <div class='products-list'>
          <div class="panel-title">Top of paticipants by deviation</div>
          <div class="table-wrapper-scroll-y custom-scrollbar bg-white" id="custom-scrollbar">
            <table class='table table-hover tb-top-participant'>
              <thead>
                <tr>
                  <th scope='col'>#</th>
                  <th scope='col'>Address</th>
                  <th scope='col'>Fullname</th>
                  <th scope='col'>Session</th>
                  <th scope='col'>Deviation</th>
                </tr>
              </thead>
              <tbody>
                {
                  topParticipants
                    ? topParticipants.map((p, i) => {
                      p.no = i + 1;
                      return (
                        <tr>
                          <td>{p.no}</td>
                          <td>{p.address}</td>
                          <td>{p.fullname}</td>
                          <td>{p.nSessions}</td>
                          <td>{p.deviation}%</td>
                        </tr>
                      );
                    })
                    : isAdmin
                      ? <tr><td colspan="5" style="text-align: center">No data</td></tr>
                      : <tr><td colspan="5" style="text-align: center">Only admin can see participants</td></tr>
                }
              </tbody>
            </table>
            <div class="progress">
              <div class="progress-bar bg-custom" role="progressbar" style="width: 55%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">55%</div>
            </div>

            <div class="progress">
              <div class="progress-bar bg-primary" role="progressbar" style="width: 48%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">48%</div>

            </div>

            <div class="progress">
              <div class="progress-bar bg-warning" role="progressbar" style="width: 30%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">30%</div>
            </div>

            <div class="progress">
              <div class="progress-bar bg-danger" role="progressbar" style="width: 15%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">15%</div>
            </div>
          </div>
        </div>
        <div class='pl-2 flex product-detail'>
          <div class="panel-title">Graph of "Suggest Price" and "Final Price"</div>
          <div class="bg-white" id="sessionAlert" style="text-align: center; height: 98px">No data</div>
          <canvas class="bg-white" id="sessionChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export { Home };
