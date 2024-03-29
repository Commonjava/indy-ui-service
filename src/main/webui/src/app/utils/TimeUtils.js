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

export const TimeUtils = {
  secondsToDuration: (secs, useDefault) => {
    if ((secs === undefined || secs === 0) && useDefault) {
      return "default";
    }

    if (secs === undefined){
      return 'never';
    }

    if (secs < 1){
      return 'never';
    }

    const hours = Math.floor(secs / (60 * 60));

    const mdiv = secs % (60 * 60);
    const minutes = Math.floor(mdiv / 60);

    const sdiv = mdiv % 60;
    const seconds = Math.ceil(sdiv);

    let out = '';
    if (hours > 0){
      out += hours + 'h';
    }

    if (minutes > 0){
      if (out.length > 0){
        out += ' ';
      }
      out += minutes + 'm';
    }

    if (seconds > 0){
      if (out.length > 0){
        out += ' ';
    }
      out += seconds + 's';
    }

    return out;
  },
  timestampToDateFormat: milliseconds=>{
    if (milliseconds === undefined){
      return 'never';
    }

    if (milliseconds < 1){
      return 'never';
    }

    const date = new Date();
    date.setTime(milliseconds);
    return date.toLocaleString();
  },
  timestampToCurrentAsDuration: secs=>{
    if (secs === undefined){
      return 'never';
    }

    if (secs < 1){
      return 'never';
    }
    const nextDate = new Date(secs);
    const toDay = new Date();
    const total = nextDate.getTime() - toDay.getTime();
    return TimeUtils.secondsToDuration(total / 1000);
  }
};
