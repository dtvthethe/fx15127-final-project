import { h } from 'hyperapp';

const ProgressBar = ({ deviation }) => {
  const creditRating = 100 - (deviation || 0);
  let bgColor = 'bg-primary';
  let textColor = '#fff';

  switch (true) {
    case creditRating > 80:
      bgColor = 'bg-success';
      textColor = '#fff';

      break;
    case creditRating > 60:
      bgColor = 'bg-primary';
      textColor = '#fff';

      break;
    case creditRating > 40:
      bgColor = 'bg-warning';
      textColor = 'red';

      break;
    default:
      bgColor = 'bg-danger';
      textColor = 'red';
  }

  return (
    <div class="progress">
      <div class={`progress-bar ${bgColor}`} role="progressbar" style={`width : ${creditRating}%; color: ${textColor}`} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">{creditRating}%</div>
    </div>
  );
};

export { ProgressBar };

