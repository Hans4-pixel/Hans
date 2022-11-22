import {
  RESIZE,
  TYPOGRAPHY,
} from '../../../../../helpers/constants/design-system';

function getValues(pendingApproval, t, actions) {
  const { title, description, textAreaContent } = pendingApproval.requestData;

  return {
    content: [
      {
        element: 'Typography',
        key: 'title',
        children: title,
        props: {
          variant: TYPOGRAPHY.H3,
          align: 'center',
          fontWeight: 'bold',
          boxProps: {
            margin: [0, 0, 4],
          },
        },
      },
      ...(description
        ? [
            {
              element: 'Typography',
              key: 'subtitle',
              children: description,
              props: {
                variant: TYPOGRAPHY.H6,
                align: 'center',
                boxProps: {
                  margin: [0, 0, 4],
                },
              },
            },
          ]
        : []),
      ...(textAreaContent
        ? [
            {
              element: 'div',
              key: 'text-area',
              children: {
                element: 'TextArea',
                props: {
                  // TODO(ritave): Terrible hard-coded height hack. Fixing this to adjust automatically to current window height would
                  //               mean allowing template compoments to change global css, and since the intended use of the template
                  //               renderer was to allow users to build their own UIs, this would be a big no-no.
                  height: '238px',
                  value: textAreaContent,
                  readOnly: true,
                  resize: RESIZE.VERTICAL,
                  scrollable: true,
                  className: 'text',
                },
              },
              props: {
                className: 'snap-confirmation',
              },
            },
          ]
        : []),
    ],
    cancelText: t('reject'),
    submitText: t('approveButtonText'),
    onSubmit: () => actions.resolvePendingApproval(pendingApproval.id, true),
    onCancel: () => actions.resolvePendingApproval(pendingApproval.id, false),
  };
}

const snapConfirmation = {
  getValues,
};

export default snapConfirmation;
