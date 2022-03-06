import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@material-ui/core';
import { memo } from 'react';
import I18n from '../../utils/I18n';

type Props = {
  openingHours: string;
};

export default memo(function OpeningHours(props: Props) {
  const { openingHours } = props;
  const json = JSON.parse(openingHours);

  if (!json) {
    return null;
  }

  return (
    <div>
      <br />
      <Typography variant="subtitle2" color="textSecondary">
        {I18n.t('opening hours')}
      </Typography>
      <Table>
        <TableBody>
          {json.weekday_text.map(weekday => {
            const [key, text] = weekday.split(': ');
            return (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell align="right">{text}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});
