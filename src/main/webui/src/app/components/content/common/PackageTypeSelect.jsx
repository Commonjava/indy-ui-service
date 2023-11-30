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
import {PropTypes} from 'prop-types';
import {jsonRest} from '#utils/RestClient.js';
import {Utils} from '#utils/AppUtils';

export const PackageTypeSelect = ({packageType,vauleChangeHandler}) =>{
  const [state, setState] = useState({
    pkgTypes: []
  });

  useEffect(()=>{
    const fetchPkgTypes = async () =>{
      const response = await jsonRest.get('/api/stats/package-type/keys');
      if (response.ok){
        const pkgTypes = await response.json();
        setState({pkgTypes});
      }else{
        Utils.logMessage(response);
      }
    };
    fetchPkgTypes();
  }, []);

  const selectedValue = packageType || "maven";
  const onChangeHandler = vauleChangeHandler || (()=>{});
  return <span>
    <select value={selectedValue} onChange={onChangeHandler}>
      {
        state.pkgTypes.map(type => <option key={`pkgType:${type}`} value={type}>{type}</option>)
      }
    </select>
  </span>;
};

PackageTypeSelect.propTypes = {
  packageType: PropTypes.string,
  vauleChangeHandler: PropTypes.func
};