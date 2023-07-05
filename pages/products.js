import { app, h } from 'hyperapp';
import './products.css';
import JSAlert from 'js-alert';
import Toastify from 'toastify-js';
import { config } from '../config';

const Fragment = (props, children) => children;

const Product = ({ product, newProduct, input, create, isAdmin, fn, currentProductIndex }) => {
  let price = null;
  return (
    <>
      {product ? (
        <div class='card product'>
          <div class='card-header'>
            <strong>{product.name}</strong>
          </div>
          <div class='card-body'>
            <img
              class='rounded float-left product-image'
              src={
                product.image.startsWith('http')
                  ? product.image
                  : '//robohash.org/' + product.image + '?set=set4&bgset=bg2'
              }
            ></img>

            <dl class='row'>
              <dt class='col-sm-4'>Name</dt>
              <dd class='col-sm-8'>
                <h5>{product.name}</h5>
              </dd>

              <dt class='col-sm-4'>Description</dt>
              <dd class='col-sm-8'>
                <p>{product.description}</p>
              </dd>

              <dt class='col-sm-4'>Proposed Price</dt>
              <dd class='col-sm-8'>
                {/* <p>$ {product.price / 100}</p> */}
                <p>$ {product.priceFormat}</p>
              </dd>

              <dt class='col-sm-4'>Final Price</dt>
              <dd class='col-sm-8'>
                <p>$ {product.finalPriceFormat}</p>
              </dd>

              <dt class='col-sm-4'>Status</dt>
              <dd class='col-sm-8'>
                <p>
                <span class={`badge badge-${config.sessionBadgeClasses[product.status]}`}>
                  {config.SESSION_STATUS_TEXT[product.status] || 'N/A'}
                </span>
                </p>
              </dd>
            </dl>
          </div>
          {isAdmin ? (
            <div class='card-footer'>
              <div class='input-group'>
                <div class='input-group-prepend'>
                  <button
                    class='btn btn-outline-primary'
                    type='button'
                    onclick={e => fn({ type: 'start', payload: {index: currentProductIndex} })}
                  >
                    Start
                  </button>
                  <button
                    class='btn btn-outline-primary'
                    type='button'
                    onclick={e => fn({ type: 'stop', payload: {index: currentProductIndex}})}
                  >
                    Stop
                  </button>
                </div>
                <input
                  type='number'
                  class='form-control'
                  placeholder='price'
                  oninput={e => (price = e.target.value)}
                />
                <div class='input-group-append'>
                  <button
                    class='btn btn-outline-primary'
                    type='button'
                    onclick={e => fn({ type: 'close', payload: {index: currentProductIndex, price}})}
                  >
                    Set price and close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div class='card-footer'>
              <div class='input-group'>
                <input
                  type='number'
                  class='form-control'
                  placeholder='price'
                  oninput={e => (price = e.target.value)}
                  disabled={product.status != config.SESSION_STATUS.PRICING}
                />
                <div class='input-group-append'>
                  <button
                    class='btn btn-primary'
                    type='button'
                    disabled={product.status != config.SESSION_STATUS.PRICING}
                    onclick={e => fn({ type: 'pricing', payload: {index: currentProductIndex, price}})}
                  >
                    Propose price
                  </button>
                </div>
              </div>
              {product.status != config.SESSION_STATUS.PRICING
                ? (<div class='input-group text-center'>
                  <p class='w-100 mb-0 mt-1 text-danger'>This input only enable when Session status is <strong>PRICING</strong></p>
                </div>)
                : <></>}
            </div>
          )}
        </div>
      ) : (
        <></>
      )}

      {
        isAdmin && (<div class='card'>
          <div class='card-header'>
            <strong>Create new session</strong>
          </div>
          <div class='card-body'>
            <div class='row'>
              <div class='col-sm-12'>
                <div class='form-group'>
                  <label for='name'>Product name</label>
                  <input
                    type='text'
                    class='form-control'
                    id='name'
                    value={newProduct.name}
                    oninput={e => {
                      input({ field: 'name', value: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>

            <div class='row'>
              <div class='col-sm-12'>
                <div class='form-group'>
                  <label for='description'>Product description</label>
                  <input
                    type='text'
                    class='form-control'
                    id='description'
                    value={newProduct.description}
                    oninput={e => {
                      input({ field: 'description', value: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>

            <div class='row'>
              <div class='col-sm-12'>
                <div class='form-group'>
                  <label for='image'>Product image</label>
                  <input
                    type='text'
                    class='form-control'
                    id='image'
                    placeholder='http://'
                    value={newProduct.image}
                    oninput={e => {
                      input({ field: 'image', value: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div class='card-footer'>
            <button type='submit' class='btn btn-primary' onclick={create}>
              Create
            </button>
          </div>
        </div>)
      }
    </>
  );
};

const ProductRow = ({ product, index, select, currentIndex }) => (
  <tr
    onclick={e => select(index)}
    class={index === currentIndex ? 'active' : ''}
  >
    <th scope='row'>{product.no}</th>
    <td>{product.name}</td>
    <td>{product.description} </td>
    <td>$ {product.priceFormat}</td>
    <td>
      <span class={`badge badge-${config.sessionBadgeClasses[product.status]}`}>
        {config.SESSION_STATUS_TEXT[product.status] || 'N/A'}
      </span>
    </td>
  </tr>
);

const Products = ({ match }) => (
  { newProduct, sessions, currentProductIndex, isAdmin, location },
  { inputNewProduct, createProduct, selectProduct, sessionFn }
) => {
  document.title = `Products | ${config.APP_NAME}` || 'N/A';

  const handleSessionFn = async (params) => {
    const loading = JSAlert.loader('Please wait...');

    try {
      await sessionFn(params);
      loading.dismiss();
      Toastify({
        text: 'Session status saved!',
        position: 'center',
        backgroundColor: config.color.success
      }).showToast();
    } catch (error) {
      console.log(error);
      loading.dismiss();
      Toastify({
        text: 'Error on handle update session status!',
        position: 'center',
        backgroundColor: config.color.error
      }).showToast();
    }
  }

  const create = async () => {
    const loading = JSAlert.loader('Please wait...');

    try {
      await createProduct();
      loading.dismiss();
      Toastify({
        text: 'Session saved!',
        position: 'center',
        backgroundColor: config.color.success
      }).showToast();
    } catch (error) {
      console.log(error);
      loading.dismiss();
      Toastify({
        text: 'Error on handle create Session!',
        position: 'center',
        backgroundColor: config.color.error
      }).showToast();
    }
  }

  return (
    <div class='d-flex w-100 h-100'>
      <div class='bg-white border-right products-list'>
        <table class='table table-hover table-striped'>
          <thead>
            <tr>
              <th scope='col'>#</th>
              <th scope='col'>Product</th>
              <th scope='col'>Description</th>
              <th scope='col'>Proposed price</th>
              <th scope='col'>Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((p, i) => {
              p.no = i + 1;
              return (
                <ProductRow
                  product={p}
                  index={i}
                  select={selectProduct}
                  currentIndex={currentProductIndex}
                  isAdmin={isAdmin}
                ></ProductRow>
              );
              // return ProductRow(p, i, selectProduct, currentProductIndex);
            })}
          </tbody>
        </table>
      </div>
      <div class='pl-2 flex product-detail'>
        <Product
          newProduct={newProduct}
          input={inputNewProduct}
          create={create}
          product={sessions[currentProductIndex]}
          isAdmin={isAdmin}
          fn={handleSessionFn}
          currentProductIndex={currentProductIndex}
        ></Product>
      </div>
    </div>
  );
};

export { Products };
