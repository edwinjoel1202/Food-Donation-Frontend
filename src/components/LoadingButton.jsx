// src/components/LoadingButton.jsx
import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import LoadingOverlay from './LoadingOverlay';

const LoadingButton = ({ children, onClickAsync, variant = 'primary', size, type = 'button', className = '', ...rest }) => {
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    if (type === 'submit') {
      // if used inside form submit, caller handles preventing default
    } else {
      e?.preventDefault?.();
    }
    if (!onClickAsync) return;
    try {
      setLoading(true);
      await onClickAsync(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Button
        {...rest}
        type={type}
        variant={variant}
        size={size}
        className={className}
        onClick={handle}
        disabled={loading || rest.disabled}
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
            <span className="visually-hidden">Loading...</span>
          </>
        ) : children}
      </Button>
    </>
  );
};

export default LoadingButton;
