live
====

Live broadcasting aggregator via hackfoldr


Google Analytics Access
-----------------------

See: https://developers.google.com/admin-sdk/directory/v1/guides/delegation

Follow the instructions to create the service account and its credentials:

  1. Go to the [Google Developer Console](https://cloud.google.com/console).
  2. Select a project.
  3. In the sidebar on the left, select APIs & auth. In the displayed list of
     APIs, make sure the Admin SDK status is set to ON.
  4. In the sidebar on the left, select Credentials.

To set up a service account, select Create New Client ID. Specify that your
application type is service account, and then select Create Client ID. A dialog
box appears; to proceed, select Okay, got it. (If you already have a service
account, you can add a new key by selecting Generate new key beneath the
existing service-account credentials. A dialog box appears; to proceed, select
Okay, got it.)

  5. Convert the downloaded `.p12` to `.pem`.
    * P12 to PEM: `openssl pkcs12 -in bundle.p12 -out userkey.pem -nodes -clcerts`
    * PEM to P12: `openssl pkcs12 -export -in usercert.pem -inkey userkey.pem -out bundle.p12`

The newly created service account will have 3 attributes: Client ID, Email
address, and the public key (fingerprints).

Go to Google Analytics admin console, enter "User Management" page in "Account" section.
Enter the Email address of the service account into the "Add permission for" field, and
set the permission to "Read & Analyze".

In the analysis script, the Email address of the service account, and the prive
key in PEM format are all you need.

