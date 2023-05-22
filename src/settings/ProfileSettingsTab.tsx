/*
Copyright 2022 - 2023 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { ChangeEvent, useCallback, useState } from "react";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { useTranslation } from "react-i18next";

import { Button } from "../button";
import { useProfile } from "../profile/useProfile";
import { FieldRow, InputField, ErrorMessage } from "../input/Input";
import { AvatarInputField } from "../input/AvatarInputField";
import styles from "./ProfileSettingsTab.module.css";

interface Props {
  client: MatrixClient;
}
export function ProfileSettingsTab({ client }: Props) {
  const { t } = useTranslation();
  const {
    error,
    loading,
    displayName: initialDisplayName,
    avatarUrl,
    saveProfile,
  } = useProfile(client);
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const onRemoveAvatar = useCallback(() => {
    setRemoveAvatar(true);
  }, []);

  const onChangeDisplayName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setDisplayName(e.target.value);
    },
    [setDisplayName]
  );

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const displayNameDataEntry = data.get("displayName");
      const avatar: File | string = data.get("avatar");

      const avatarSize =
        typeof avatar == "string" ? avatar.length : avatar.size;
      const displayName =
        typeof displayNameDataEntry == "string"
          ? displayNameDataEntry
          : displayNameDataEntry.name;

      saveProfile({
        displayName,
        avatar: avatar && avatarSize > 0 ? avatar : undefined,
        removeAvatar: removeAvatar && (!avatar || avatarSize === 0),
      });
    },
    [saveProfile, removeAvatar]
  );

  return (
    <form onSubmit={onSubmit} className={styles.content}>
      <FieldRow className={styles.avatarFieldRow}>
        <AvatarInputField
          id="avatar"
          name="avatar"
          label={t("Avatar")}
          avatarUrl={avatarUrl}
          displayName={displayName}
          onRemoveAvatar={onRemoveAvatar}
        />
      </FieldRow>
      <FieldRow>
        <InputField
          id="userId"
          name="userId"
          label={t("Username")}
          type="text"
          disabled
          value={client.getUserId()}
        />
      </FieldRow>
      <FieldRow>
        <InputField
          id="displayName"
          name="displayName"
          label={t("Display name")}
          type="text"
          required
          autoComplete="off"
          placeholder={t("Display name")}
          value={displayName}
          onChange={onChangeDisplayName}
          data-testid="profile_displayname"
        />
      </FieldRow>
      {error && (
        <FieldRow>
          <ErrorMessage error={error} />
        </FieldRow>
      )}
      <FieldRow rightAlign>
        <Button type="submit" disabled={loading}>
          {loading ? t("Saving…") : t("Save")}
        </Button>
      </FieldRow>
    </form>
  );
}
