import { h, app } from "hyperapp";
import './home.css';
import { config } from "../config";

const Home = () => {
  return (
    <div class='d-flex w-100 h-100'>
      <div class='bg-white border-right products-list d-flex aligns-items-center justify-content-center'>
        <div class="py-5">
          <table border="1" class="if">
            <tr>
              <td colspan="2" class="eg">{config.APP_NAME}</td>
            </tr>
            <tr>
              <td>MSSV</td>
              <td>fx15127</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>thedtvfx15127@funix.edu.vn</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );
};

export { Home };
