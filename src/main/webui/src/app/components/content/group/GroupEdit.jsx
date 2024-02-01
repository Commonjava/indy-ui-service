/**
 * Copyright (C) 2024 Red Hat, Inc. (https://github.com/Commonjava/indy-ui-service)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {useState, useEffect} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {PropTypes} from 'prop-types';
import {StoreEditControlPanel as EditControlPanel} from '../common/StoreControlPanels.jsx';
import {DisableTimeoutHint} from '../common/Hints.jsx';
import {PackageTypeSelect} from '../common/PackageTypeSelect.jsx';
// import ViewJsonDebugger from './Debugger.jsx';
import {Utils} from '#utils/AppUtils.js';
import {TimeUtils} from '#utils/TimeUtils.js';
import {IndyRest} from '#utils/RestClient.js';

const {statsRes, storeRes, disableRes} = IndyRest;

const EditConstituents = ({store, currentAvailable}) => {
  const [, setItems] = useState({
    'constituents': store.constituents,
    'currentAvailble': currentAvailable,
  });

  const addConstituent = available => {
    let idx = currentAvailable.indexOf(available);
    store.constituents.push(available);
    // element.addClass('hidden');
    currentAvailable.splice(idx, 1);
    setItems({
      'constituents': store.constituents,
      'currentAvailble': currentAvailable,
    });
  };

  const removeConstituent = constituent => {
    let idx = store.constituents.indexOf(constituent);

    currentAvailable.push(constituent);

    store.constituents.splice(idx, 1);

    Utils.sortEndpoints(currentAvailable);
    setItems({
      'constituents': store.constituents,
      'currentAvailble': currentAvailable,
    });
  };

  const moveItem = (from, to) => {
    let temp = store.constituents.splice(from, 1)[0];
    store.constituents.splice(to, 0, temp);
  };

  const promote = constituent => {
    let idx = store.constituents.indexOf(constituent);
    if (idx > 0) {
      moveItem(idx, idx - 1);
      setItems({
        'constituents': store.constituents,
        'currentAvailble': currentAvailable,
      });
    }
  };

  const demote = constituent => {
    let idx = store.constituents.indexOf(constituent);
    if (idx < store.constituents.length - 1) {
      moveItem(idx, idx + 1);
      setItems({
        'constituents': store.constituents,
        'currentAvailble': currentAvailable,
      });
    }
  };

  const top = constituent => {
    let idx = store.constituents.indexOf(constituent);
    moveItem(idx, 0);
    setItems({
      'constituents': store.constituents,
      'currentAvailble': currentAvailable,
    });
  };

  const bottom = constituent => {
    let idx = store.constituents.indexOf(constituent);
    moveItem(idx, store.constituents.length - 1);
    setItems({
      'constituents': store.constituents,
      'currentAvailble': currentAvailable,
    });
  };

  return <div className="fieldset">
    <ol className="left-half detail-value detail-edit-list">
      <lt><label>Current:</label><span className="hint">(hover for controls)</span></lt>
      {
        store.constituents && store.constituents.map((item, index) => <li key={`constituent-${item}`}><div className="constituent">
          <div className="inline value">{item}</div>
          <div className="inline inline-cp">
            <a href="" title="Remove from constituents" className="inline-cp-action" onClick={e => {
              e.preventDefault();
              removeConstituent(item);
            }}>&#x2718;</a>
            {
              index !== 0 && <a href="" title="Promote priority" className="inline-cp-action" onClick={e => {
                e.preventDefault();
                promote(item);
              }}>&uarr;</a>
            }
            {
              index !== 0 && <a href="" title="Top priority" className="inline-cp-action" onClick={e => {
                e.preventDefault();
                top(item);
              }}>&#x219f; </a>
            }
            {
              index !== store.constituents.length - 1 && <a href="" title="Demote priority" className="inline-cp-action" onClick={e => {
                e.preventDefault();
                demote(item);
              }}>&darr;</a>
            }
            {
              index !== store.constituents.length - 1 && <a href="" title="Bottom priority" className="inline-cp-action" onClick={e => {
                e.preventDefault();
                bottom(item);
              }}>&#x21a1;</a>
            }
          </div>
        </div>
        </li>)
      }
    </ol>
    <ol className="right-half detail-value detail-edit-list">
      <lt><label>Available:</label><span className="hint">(click to add to constituents)</span></lt>
      {
        currentAvailable && currentAvailable.map(item => <li key={`available-${item}`}><div className="available">
          <a href="" title="Add to constituents" className="surround-cp-action" onClick={e => {
            e.preventDefault();
            addConstituent(item);
          }}>
            <div className="inline value">{item}</div><span className="inline-cp">+</span>
          </a>
        </div>
        </li>)
      }
    </ol>
  </div>;
};

EditConstituents.propTypes = {
  store: PropTypes.object,
  currentAvailable: PropTypes.array,
};

export default function GroupEdit() {
  const [state, setState] = useState({
    available: [],
    store: {},
    storeView: {}
  });
  const location = useLocation();
  const {packageType, name} = useParams();
  const {
    register,
    reset,
    trigger,
    handleSubmit,
    formState: {errors}
  } = useForm();

  const path = location.pathname;
  const mode = path.match(/.*\/new$/u) ? 'new' : 'edit';
  // Give a default packageType
  let store = {"packageType": "maven", "type": "group", "constituents": []};
  let available = [];
  useEffect(() => {
    if (mode === 'edit') {
      const fetchStore = async () => {
        // get Store data
        const res = await storeRes.get(packageType, "group", name);
        if (res.success) {
          const raw = res.result;
          const storeView = Utils.cloneObj(raw);
          storeView.disabled = raw.disabled === undefined ? false : raw.disabled;
          // get available Store data
          const availableRes = await statsRes.getAllEndpoints();
          let allAvailable = new Set();
          if (availableRes.success) {
            let availableResult = availableRes.result.items;
            availableResult.forEach(item => allAvailable.add(item.packageType + ':' + item.type + ':' + item.name));
            raw.constituents.forEach(item => allAvailable.delete(item));
          } else {
            Utils.logMessage(`Getting available constituents failed! Error reason: ${statsRes.error.message}`);
          }
          // get Store disablement data
          const timeoutRes = await disableRes.getStoreTimeout(packageType, "group", name);
          const cloned = Utils.cloneObj(storeView);
          if (timeoutRes.success) {
            const timeout = timeoutRes.result;
            cloned.disableExpiration = timeout.expiration;
          } else {
            Utils.logMessage(`disable timeout getting failed! Error reason: ${timeoutRes.error.message}`);
          }
          // Change state and re-rendering
          setState({
            storeView: cloned,
            store: raw,
            available: Array.from(allAvailable),
          });
          reset(raw);
        } else {
          // TODO: find another way to do error handling
          Utils.logMessage(`Failed to get store data. Error reason: ${res.error.status}->${res.error.message}`);
        }
      };

      fetchStore();
    }

    if (mode === 'new') {
      (async () => {
        // get available Store data
        const availableRes = await statsRes.getAllEndpoints();
        let allAvailable = new Set();
        if (availableRes.success) {
          let availableResult = availableRes.result.items;
          availableResult.forEach(item => allAvailable.add(item.packageType + ':' + item.type + ':' + item.name));
          setState({
            available: Array.from(allAvailable),
          });
        } else {
          Utils.logMessage(`Getting available constituents failed! Error reason: ${statsRes.error.message}`);
        }
      })();
    }
  }, [packageType, name, mode, reset]);

  if (mode === 'edit') {
    store = state.store;
  }

  available = state.available;

  const changelog = register("changelog");
  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="control-panel">
        <EditControlPanel mode={mode} store={store}
          handleSubmit={handleSubmit} validate={trigger} changelog={changelog} />
      </div>

      <div className="content-panel">
        <div className="fieldset-caption">Basics</div>
        <div className="fieldset">
          <div className="detail-field">
            <label>Package Type:</label>
            {
              mode === 'new' ?
                <PackageTypeSelect register={register} formErrors={errors} /> :
                <span className="key">{store.packageType}</span>
            }
          </div>
          <div className="detail-field">
            <label>Name:</label>
            {
              mode === 'new' ?
                <span>
                  <input type="text" size="25" {...register("name", {required: true, maxLength: 50})}
                  />{' '}
                  {errors.name?.type === "required" && <span className="alert">Name is required</span>}
                  {errors.name?.type === "maxLength" && <span className="alert">Name&apos;s length should be less than 50</span>}
                </span> :
                <span className="key">{store.name}</span>
            }
          </div>

          <div className="detail-field">
            <input type="checkbox" defaultChecked={!store.disabled} {...register("enabled")} />{' '}
            <label>Enabled?</label>
            {
              store.disabled && store.disableExpiration &&
              <span className="hint">Set to automatically re-enable at {TimeUtils.timestampToDateFormat(store.disableExpiration)}</span>
            }
          </div>
          <div className="detail-field">
            <input type="checkbox" defaultChecked={store.prepend_constituent} {...register("prepend_constituent")} />{' '}
            <label>Prepend Constituents?</label>
            <span className="hint">If enabled, all new constituents which are added not manually(like promotion) will be at the top of constituents list</span>
          </div>

          <div className="sub-fields">
            <div className="detail-field">
              <label>Disable Timeout:</label>
              <input type="number" defaultValue={store.disable_timeout}
                {...register("disable_timeout", {min: -1, max: 999999999})} />{' '}
              {errors.disable_timeout && <span className="alert">Not a valid number</span>}<br />
              <DisableTimeoutHint />
            </div>
          </div>

          <div className="fieldset-caption">Description</div>
          <div className="fieldset">
            <textarea rows="3" className="text-description" {...register("description")}>
              {store.description}
            </textarea>
          </div>
          <div className="fieldset-caption">Constituents</div>
          <EditConstituents store={store} currentAvailable={available}/>
        </div>
      </div>
      {
        // <ViewJsonDebugger enableDebug={enableDebug} storeJson={storeJson} rawJson={rawJson}
      }
    </form>
  );
}

GroupEdit.propTypes = {
  store: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object
};
