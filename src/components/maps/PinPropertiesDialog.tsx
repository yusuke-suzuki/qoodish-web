'use client';

import { Add } from '@mui/icons-material';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import type {
  AppMap,
  PinProperty,
  PinPropertyOption
} from '../../../types/index.ts';
import {
  createPinProperty,
  createPinPropertyOption,
  deletePinProperty,
  deletePinPropertyOption,
  updatePinProperty,
  updatePinPropertyOption
} from '../../actions/pinProperties.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import AppDialog from '../common/AppDialog.tsx';
import ConfirmDialog from '../common/ConfirmDialog.tsx';
import NewPinPropertyForm, {
  type NewPinProperty
} from './NewPinPropertyForm.tsx';
import PinPropertyListItem from './PinPropertyListItem.tsx';

type DeleteTarget =
  | { kind: 'property'; property: PinProperty }
  | { kind: 'option'; property: PinProperty; option: PinPropertyOption };

type Props = {
  open: boolean;
  onClose: () => void;
  map: AppMap;
  pinProperties: PinProperty[];
  defaultCreating?: boolean;
};

export default function PinPropertiesDialog({
  open,
  onClose,
  map,
  pinProperties,
  defaultCreating = false
}: Props) {
  const dictionary = useDictionary();
  const router = useRouter();

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [creating, setCreating] = useState(defaultCreating);

  const openDelete = (target: DeleteTarget) => {
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const finish = (result: { success: boolean; error?: string }) => {
    if (result.success) {
      router.refresh();
    }

    if (result.error || !result.success) {
      enqueueSnackbar(result.error ?? dictionary['an error occurred'], {
        variant: 'error'
      });
    }

    return result.success;
  };

  const handleCreate = async (property: NewPinProperty) =>
    finish(await createPinProperty(map.id, property));

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const result =
      deleteTarget.kind === 'property'
        ? await deletePinProperty(map.id, deleteTarget.property.id)
        : await deletePinPropertyOption(
            map.id,
            deleteTarget.property.id,
            deleteTarget.option.id
          );

    if (finish(result)) {
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <AppDialog
        open={open}
        onClose={onClose}
        title={dictionary['pin properties']}
        fullScreenOnMobile
        dividers
        cancelLabel={dictionary.close}
      >
        <Typography color="text.secondary">
          {dictionary['pin properties description']}
        </Typography>
        <List disablePadding>
          {pinProperties.map((property) => (
            <PinPropertyListItem
              key={property.id}
              property={property}
              onRename={async (name) =>
                finish(await updatePinProperty(map.id, property.id, { name }))
              }
              onDelete={() => openDelete({ kind: 'property', property })}
              onCreateOption={async (name) =>
                finish(
                  await createPinPropertyOption(map.id, property.id, { name })
                )
              }
              onRenameOption={async (option, name) =>
                finish(
                  await updatePinPropertyOption(
                    map.id,
                    property.id,
                    option.id,
                    { name }
                  )
                )
              }
              onDeleteOption={(option) =>
                openDelete({ kind: 'option', property, option })
              }
            />
          ))}
          {creating ? (
            <NewPinPropertyForm
              onCreate={handleCreate}
              onClose={() => setCreating(false)}
            />
          ) : (
            <ListItemButton onClick={() => setCreating(true)} sx={{ px: 0 }}>
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText primary={dictionary['add pin property']} />
            </ListItemButton>
          )}
        </List>
      </AppDialog>

      <ConfirmDialog
        open={deleteOpen}
        title={
          deleteTarget?.kind === 'option'
            ? dictionary['sure to delete pin property option']
            : dictionary['sure to delete pin property']
        }
        description={
          deleteTarget?.kind === 'option'
            ? dictionary['delete pin property option detail']
            : dictionary['delete pin property detail']
        }
        confirmLabel={dictionary.delete}
        confirmColor="error"
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
