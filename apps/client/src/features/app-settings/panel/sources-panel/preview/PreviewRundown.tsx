import { Fragment } from 'react';
import { IoLink } from 'react-icons/io5';
import { CustomFields, isOntimeBlock, isOntimeEvent, OntimeRundown } from 'ontime-types';
import { millisToString } from 'ontime-utils';

import Tag from '../../../../../common/components/tag/Tag';
import { getAccessibleColour } from '../../../../../common/utils/styleUtils';
import * as Panel from '../../../panel-utils/PanelUtils';

import style from './PreviewRundown.module.scss';

interface PreviewRundownProps {
  rundown: OntimeRundown;
  customFields: CustomFields;
}

function booleanToText(value?: boolean) {
  return value ? 'Yes' : undefined;
}

export default function PreviewRundown(props: PreviewRundownProps) {
  const { rundown, customFields } = props;

  // we only count Ontime Events which are 1 based in client
  let eventIndex = 0;

  const fieldKeys = Object.keys(customFields);
  const fieldLabels = fieldKeys.map((key) => customFields[key].label);

  return (
    <Panel.Table>
      <thead>
        <tr>
          <th>#</th>
          <th>Type</th>
          <th>Cue</th>
          <th>Title</th>
          <th>Time Start</th>
          <th>Time End</th>
          <th>Duration</th>
          <th>Warning Time</th>
          <th>Danger Time</th>
          <th>Count to end</th>
          <th>Is Public</th>
          <th>Skip</th>
          <th>Colour</th>
          <th>Timer Type</th>
          <th>End Action</th>
          {fieldLabels.map((label) => (
            <th key={label}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rundown.map((event) => {
          if (isOntimeBlock(event)) {
            return (
              <tr key={event.id}>
                <td className={style.center}>
                  <Tag>-</Tag>
                </td>
                <td className={style.center}>
                  <Tag>{event.type}</Tag>
                </td>
                <td />
                <td colSpan={99}>{event.title}</td>
              </tr>
            );
          }
          if (!isOntimeEvent(event)) {
            return null;
          }
          eventIndex += 1;
          const colour = event.colour ? getAccessibleColour(event.colour) : {};
          const countToEnd = booleanToText(event.countToEnd);
          const isPublic = booleanToText(event.isPublic);
          const skip = booleanToText(event.skip);

          return (
            <Fragment key={event.id}>
              <tr>
                <td className={style.center}>
                  <Tag>{eventIndex}</Tag>
                </td>
                <td className={style.center}>
                  <Tag>{event.type}</Tag>
                </td>
                <td className={style.nowrap}>{event.cue}</td>
                <td>{event.title}</td>
                <td className={style.flex}>
                  <span className={event.linkStart ? style.subdued : undefined}>{millisToString(event.timeStart)}</span>
                  {event.linkStart && <IoLink className={style.linkStartActive} />}
                </td>
                <td>{millisToString(event.timeEnd)}</td>
                <td>{millisToString(event.duration)}</td>
                <td>{millisToString(event.timeWarning)}</td>
                <td>{millisToString(event.timeDanger)}</td>
                <td className={style.center}>{countToEnd && <Tag>{countToEnd}</Tag>}</td>
                <td className={style.center}>{isPublic && <Tag>{isPublic}</Tag>}</td>
                <td>{skip && <Tag>{skip}</Tag>}</td>
                <td style={{ ...colour }}>{event.colour}</td>
                <td className={style.center}>
                  <Tag>{event.timerType}</Tag>
                </td>
                <td className={style.center}>
                  <Tag>{event.endAction}</Tag>
                </td>
                {isOntimeEvent(event) &&
                  fieldKeys.map((field) => {
                    let value = '';
                    if (field in event.custom) {
                      value = event.custom[field];
                    }
                    return <td key={field}>{value}</td>;
                  })}
              </tr>
              {event.note && (
                <tr>
                  <td colSpan={99} className={style.secondaryRow}>
                    Note: {event.note}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </Panel.Table>
  );
}
