import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { PageContainerFooter } from '../../../../components/ui/page-container';
import PermissionsConnectPermissionList from '../../../../components/app/permissions-connect-permission-list';
import PermissionsConnectFooter from '../../../../components/app/permissions-connect-footer';
import PermissionConnectHeader from '../../../../components/app/permissions-connect-header';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import SnapInstallWarning from '../../../../components/app/flask/snap-install-warning';
import Box from '../../../../components/ui/box/box';
import {
  AlignItems,
  BLOCK_SIZES,
  BorderStyle,
  FLEX_DIRECTION,
  JustifyContent,
  TypographyVariant,
} from '../../../../helpers/constants/design-system';
import Typography from '../../../../components/ui/typography';
import { getSnapInstallWarnings } from '../util';
import PulseLoader from '../../../../components/ui/pulse-loader/pulse-loader';
import InstallError from '../../../../components/app/flask/install-error/install-error';

export default function SnapInstall({
  request,
  requestState,
  approveSnapInstall,
  rejectSnapInstall,
  targetSubjectMetadata,
}) {
  const t = useI18nContext();

  const [isShowingWarning, setIsShowingWarning] = useState(false);

  const onCancel = useCallback(
    () => rejectSnapInstall(request.metadata.id),
    [request, rejectSnapInstall],
  );

  const onSubmit = useCallback(
    () => approveSnapInstall(request.metadata.id),
    [request, approveSnapInstall],
  );

  const hasPermissions =
    !requestState.loading &&
    !requestState.error &&
    requestState?.permissions &&
    Object.keys(requestState.permissions).length > 0;

  const hasError = !requestState.loading && requestState.error;

  const isLoading = requestState.loading;

  const warnings = getSnapInstallWarnings(
    requestState?.permissions ?? {},
    targetSubjectMetadata,
    t,
  );

  const shouldShowWarning = warnings.length > 0;

  const handleSubmit = () => {
    if (!hasError && shouldShowWarning) {
      setIsShowingWarning(true);
    } else if (hasError) {
      onCancel();
    } else {
      onSubmit();
    }
  };

  return (
    <Box
      className="page-container snap-install"
      justifyContent={JustifyContent.spaceBetween}
      height={BLOCK_SIZES.FULL}
      borderStyle={BorderStyle.none}
      flexDirection={FLEX_DIRECTION.COLUMN}
    >
      <Box
        className="headers"
        alignItems={AlignItems.center}
        flexDirection={FLEX_DIRECTION.COLUMN}
      >
        <PermissionConnectHeader
          icon={targetSubjectMetadata.iconUrl}
          iconName={targetSubjectMetadata.name}
          headerTitle={t('snapInstall')}
          headerText={null} // TODO(ritave): Add header text when snaps support description
          siteOrigin={targetSubjectMetadata.origin}
          isSnapInstallOrUpdate
          snapVersion={targetSubjectMetadata.version}
          boxProps={{ alignItems: AlignItems.center }}
        />
        {isLoading && (
          <Box
            className="loader-container"
            flexDirection={FLEX_DIRECTION.COLUMN}
            alignItems={AlignItems.center}
            justifyContent={JustifyContent.center}
          >
            <PulseLoader />
          </Box>
        )}
        {hasError && <InstallError error={requestState.error} />}
        {hasPermissions && (
          <>
            <Typography
              boxProps={{
                padding: [4, 4, 0, 4],
              }}
              variant={TypographyVariant.H7}
              as="span"
            >
              {t('snapRequestsPermission')}
            </Typography>
            <PermissionsConnectPermissionList
              permissions={requestState.permissions || {}}
            />
          </>
        )}
      </Box>
      <Box
        className="footers"
        alignItems={AlignItems.center}
        flexDirection={FLEX_DIRECTION.COLUMN}
      >
        <Box className="snap-install__footer--no-source-code" paddingTop={4}>
          <PermissionsConnectFooter />
        </Box>
        <PageContainerFooter
          cancelButtonType="default"
          hideCancel={hasError}
          disabled={isLoading}
          onCancel={onCancel}
          cancelText={t('cancel')}
          onSubmit={handleSubmit}
          submitText={t(
            // eslint-disable-next-line no-nested-ternary
            hasError ? 'ok' : hasPermissions ? 'approveAndInstall' : 'install',
          )}
        />
      </Box>
      {isShowingWarning && (
        <SnapInstallWarning
          onCancel={() => setIsShowingWarning(false)}
          onSubmit={onSubmit}
          warnings={warnings}
        />
      )}
    </Box>
  );
}

SnapInstall.propTypes = {
  request: PropTypes.object.isRequired,
  requestState: PropTypes.object.isRequired,
  approveSnapInstall: PropTypes.func.isRequired,
  rejectSnapInstall: PropTypes.func.isRequired,
  targetSubjectMetadata: PropTypes.shape({
    iconUrl: PropTypes.string,
    name: PropTypes.string,
    origin: PropTypes.string.isRequired,
    sourceCode: PropTypes.string,
    version: PropTypes.string,
  }).isRequired,
};
