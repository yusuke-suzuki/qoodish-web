import {
  ArrowDropDownCircleOutlined,
  FormatListBulleted
} from '@mui/icons-material';

type Props = {
  multiple: boolean;
};

export default function PinPropertyTypeIcon({ multiple }: Props) {
  return multiple ? <FormatListBulleted /> : <ArrowDropDownCircleOutlined />;
}
