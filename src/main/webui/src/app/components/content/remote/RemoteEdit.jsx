/**
 * Copyright (C) 2023 Red Hat, Inc. (https://github.com/Commonjava/indy-ui-service)
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
import {DisableTimeoutHint, DurationHint, Hint} from '../common/Hints.jsx';
import {PackageTypeSelect} from '../common/PackageTypeSelect.jsx';
// import ViewJsonDebugger from './Debugger.jsx';
import {Utils} from '#utils/AppUtils.js';
import {TimeUtils} from '#utils/TimeUtils.js';
import {IndyRest} from '#utils/RestClient.js';
import {PATTERNS} from "../../ComponentConstants.js";

const {storeRes, disableRes} = IndyRest;

export default function RemoteEdit() {
  const [state, setState] = useState({
    store: {},
    storeView: {}
  });
  const [useProxy, setUseProxy] = useState(false);
  const [useAuth, setUseAuth] = useState(false);
  const [useX509, setUseX509] = useState(false);
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
  const mode = path.match(/.*\/new$/u)? 'new':'edit';
  // Give a default packageType
  let store = {"packageType": "maven", "type": "remote"};
  useEffect(()=>{
    if(mode === 'edit'){
      const fetchStore = async () =>{
        // get Store data
        const res = await storeRes.get(packageType, "remote", name);
        if (res.success){
          const raw = res.result;
          const storeView = Utils.cloneObj(raw);
          storeView.disabled = raw.disabled === undefined ? false : raw.disabled;
          storeView.useX509 = raw.server_certificate_pem || raw.key_certificate_pem;
          storeView.useProxy = raw.proxy_host && true;
          // eslint-disable-next-line no-extra-parens
          storeView.useAuth = (storeView.useProxy && storeView.proxy_user) || storeView.user;
          // get Store disablement data
          const timeoutRes = await disableRes.getStoreTimeout(packageType, "remote", name);
          const cloned = Utils.cloneObj(storeView);
          if (timeoutRes.success){
            const timeout = timeoutRes.result;
            cloned.disableExpiration = timeout.expiration;
          }else{
            Utils.logMessage(`disable timeout getting failed! Error reason: ${timeoutRes.error.message}`);
          }
          // Change state and re-rendering
          setState({
            storeView: cloned,
            store: raw
          });
          reset(raw);
          setUseProxy(cloned.useProxy);
          setUseAuth(cloned.useAuth);
          setUseX509(cloned.useX509);
        }else{
          // TODO: find another way to do error handling
          Utils.logMessage(`Failed to get store data. Error reason: ${res.error.status}->${res.error.message}`);
        }
      };

      fetchStore();
    }
  }, [packageType, name, mode, reset]);

  let storeView = {};
  if (mode === 'edit'){
    store = state.store;
    storeView = state.storeView;
  }

  const handleUseProxy = event=>{
    setUseProxy(event.target.checked);
  };
  const handleUseAuth = event => {
    setUseAuth(event.target.checked);
  };
  const handleUseX509 = event => {
    setUseX509(event.target.checked);
  };

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
              mode==='new'?
                <PackageTypeSelect register={register} formErrors={errors} />:
                <span className="key">{store.packageType}</span>
            }
          </div>
          <div className="detail-field">
            <label>Name:</label>
            {
              mode==='new'?
              <span>
                <input type="text" size="25" {...register("name", {required: true, maxLength: 50})}
                />{' '}
                {errors.name?.type === "required" && <span className="alert">Name is required</span>}
                {errors.name?.type === "maxLength" && <span className="alert">Name&apos;s length should be less than 50</span>}
              </span>:
              <span className="key">{store.name}</span>
            }
          </div>

          <div className="detail-field">
            <input type="checkbox" defaultChecked={!store.disabled} {...register("enabled")}/>{' '}
            <label>Enabled?</label>
            {
              store.disabled && store.disableExpiration &&
              <span className="hint">Set to automatically re-enable at {TimeUtils.timestampToDateFormat(store.disableExpiration)}</span>
            }
          </div>
          <div className="detail-field">
            <input type="checkbox" defaultChecked={store.authoritative_index} {...register("authoritative_index")} />{' '}
            <label>Authoritative content Index?</label>
            <span className="hint">Make the content index authoritative to this repository</span>
          </div>

          <div className="sub-fields">
            <div className="detail-field">
              <label>Disable Timeout:</label>
              <input type="number" defaultValue={store.disable_timeout}
               {...register("disable_timeout", {min: -1, max: 999999999})}/>{' '}
              {errors.disable_timeout && <span className="alert">Not a valid number</span>}<br />
              <DisableTimeoutHint />
            </div>
          </div>

          <div className="detail-field">
            <label>Remote URL:</label>
            <input type="text" defaultValue={store.url} size="92"
            {...register("url", {required: true, pattern: PATTERNS.URL})} />{' '}
            {errors.url?.type==="required" && <span className="alert">Remote URL is required</span>}
            {errors.url?.type==="pattern" && <span className="alert">Not a valid URL</span>}
          </div>

          <div className="sub-fields">
            <div className="detail-field">
              <input type="checkbox" defaultChecked={store.is_passthrough}
              {...register("is_passthrough")} />{' '}
              <label>{"Don't Cache Content"}</label>
              <Hint hintKey="passthrough"/>
            </div>
            {!store.is_passthrough && <React.Fragment>
              <div className="detail-field">
                <label>Content Cache Timeout:</label>
                <input type="text" defaultValue={store.cache_timeout_seconds} {...register("cache_timeout_seconds")} />
                <DurationHint />
              </div>
              <div className="detail-field">
                <label>Metadata Cache Timeout:</label>
                <input type="text" defaultValue={store.metadata_timeout_seconds} {...register("metadata_timeout_seconds")} />
                <DurationHint>{'24h 36m 00s. Negative means never timeout, 0 means using default timeout by Indy settings.'}</DurationHint>
              </div>
            </React.Fragment>
            }
          </div>
          {/* prefetch support has been disabled in new Indy.
           <div className="sub-fields">
            <div className="detail-field">
              <label>Pre-fetching Priority:</label>
              <input type="text" size="5" defaultValue={store.prefetch_priority} {...register("prefetch_priority"} />
              <PrefetchHint />
            </div>
            <div className="detail-field">
              <span><input type="checkbox" defaultChecked={store.prefetch_rescan} {...register("prefetch_rescan"} /></span>{' '}
              <label>Allow Pre-fetching Rescan?</label>
            </div>
            <div className="detail-field">
              <label>Pre-fetching Listing Type:</label>
              <input type="radio" name="prefetch_listing_type" defaultChecked={store.prefetch_listing_type==="html"} defaultValue="html" {...register("prefetch_listing_type"}/> <span>html</span>{' '}
              <input type="radio" name="prefetch_listing_type" defaultChecked={store.prefetch_listing_type==="koji"} defaultValue="koji" {...register("prefetch_listing_type"}/> <span>koji</span>
            </div>
          </div>*/}
        </div>


        <div className="fieldset-caption">Description</div>
        <div className="fieldset">
          <textarea rows="3" className="text-description" {...register("description")}>
            {store.description}
          </textarea>
        </div>

        <div className="fieldset-caption">Capabilities</div>
        <div className="fieldset">
          <div className="detail-field">
            <span>
              <input type="checkbox" defaultChecked={store.allow_releases} {...register("allow_releases")}/>
            </span>{' '}
            <label>Allow Releases</label>
          </div>
          <div className="detail-field">
            <span>
              <input type="checkbox" defaultChecked={store.allow_snapshots} {...register("allow_snapshots")}/>
            </span>{' '}
            <label>Allow Snapshots</label>
          </div>
        </div>

        <div className="fieldset-caption">Remote Access</div>
        <div className="fieldset">
          <div className="detail-field">
            <label>Request Timeout:</label>
            <input type="text" defaultValue={store.timeout_seconds} {...register("timeout_seconds")} />
            <DurationHint />
          </div>
          <div className="detail-hint">
            <Hint hintKey="request_timeout" />
          </div>

          {
            // HTTP Proxy
          }
          <div className="detail-field">
            <input type="checkbox" defaultChecked={storeView.useProxy} onChange={e=>handleUseProxy(e)} />{' '}
            <label>Use Proxy?</label>
          </div>
          {
            useProxy&&
            <div className="sub-fields">
              <div className="detail-field">
                <label>Proxy Host:</label>
                <input type="text" size="20" defaultValue={store.proxy_host} {...register("proxy_host")} />
              </div>
              <div className="detail-field">
                <label>Proxy Port:</label>
                <input type="text" size="6" defaultValue={store.proxy_port} {...register("proxy_port")} />
              </div>
            </div>
          }
          {
            // X.509 / auth
          }
          <div className="detail-field">
            <input type="checkbox" defaultChecked={storeView.useAuth} onChange={e=>handleUseAuth(e)} />{' '}
            <label>Use Authentication?</label>
          </div>
          {
            useAuth &&
            <div className="sub-fields">
              <div className="detail-field">
                <label>Username:</label>
                <input type="text" size="25" defaultValue={store.user} {...register("user")} />
              </div>
              <div className="detail-field">
                <label>Password:</label>
                <input type="password" size="25" role="password" defaultValue={store.password} {...register("password")} />
              </div>
              {
                store.use_proxy && <React.Fragment>
                <div className="detail-field">
                  <label>Proxy Username:</label>
                  <input type="text" size="20" defaultValue={store.proxy_user} {...register("proxy_user")} />
                </div>
                <div className="detail-field">
                  <label>Proxy Password:</label>
                  <input type="password" role="password" size="20" defaultValue={store.proxy_password} {...register("proxy_password")} />
                </div>
              </React.Fragment>
              }
            </div>
          }
          <div className="detail-field">
            <input type="checkbox" defaultChecked={storeView.useX509} onChange={e=>handleUseX509(e)} />{' '}
            <label>{`Use Custom X.509 Configuration?`}</label>
          </div>
          {
            useX509 && <div className="sub-fields">
            {
              useAuth &&
              <div className="detail-field">
                <label>Client Key Password:</label>
                <input type="password" role="password" defaultValue={store.key_password} {...register("key_password")} /><Hint hintKey="client_key" />
              </div>
            }
              <div className="fieldset two-col">
                {
                  useAuth &&
                  <div className="left-col">
                    <div className="textarea-label">
                      <label>Client Key</label><span className="hint">(PEM Format)</span>
                    </div>
                    {
                      // 64 columns is the original PEM line-length spec
                    }
                    <textarea className="cert" cols="68" defaultValue={store.key_certificate_pem} {...register("key_certificate_pem")}>
                    </textarea>
                  </div>
                }
                <div className="right-col">
                  <div className="textarea-label">
                    <label>Server Certificate</label><span className="hint">(PEM Format)</span>
                  </div>
                  {
                    // 64 columns is the original PEM line-length spec
                  }
                  <textarea className="cert" cols="68" defaultValue={store.server_certificate_pem} {...register("server_certificate_pem")}>
                  </textarea>
                </div>
              </div>
          </div>
          }
        </div>
      </div>
      {
        // <ViewJsonDebugger enableDebug={enableDebug} storeJson={storeJson} rawJson={rawJson}
      }
    </form>
  );
}

RemoteEdit.propTypes={
  store: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object
};
